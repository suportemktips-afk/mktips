/**
 * Envia DM de recuperação para quem saiu das comunidades MK Tips.
 * Sem links. Ritmo lento para não derrubar a sessão.
 *
 * Uso:
 *   node --env-file=.env.local scripts/recover-community-leavers.mjs --dry-run
 *   node --env-file=.env.local scripts/recover-community-leavers.mjs --send
 *   node --env-file=.env.local scripts/recover-community-leavers.mjs --send --limit 5
 */
import { execFileSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const BUCKET = 'mktips-private'
const LEAVERS_PATH = 'community-leavers.json'
const CONTACTS_PATH = 'community-contacts.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const leaversLocalPath = join(root, 'config', 'community-leavers.json')
const exportPath = join(root, 'config', 'community-contacts-export.json')
const recoveryConfigPath = join(root, 'config', 'recovery-message.json')

const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--send')
const includePartial = process.argv.includes('--include-partial')
let limit = 0
const limitEq = process.argv.find((a) => a.startsWith('--limit='))
if (limitEq) limit = Number(limitEq.split('=')[1]) || 0
else {
  const idx = process.argv.indexOf('--limit')
  if (idx >= 0) limit = Number(process.argv[idx + 1]) || 0
}

const wacli =
  process.env.WACLI_BIN ||
  join(process.env.LOCALAPPDATA || '', 'wacli', 'wacli.exe')
const account = process.env.WACLI_ACCOUNT || 'me'

const DEFAULT_MESSAGE = [
  'Oi! Tudo bem?',
  '',
  'Aqui é da equipe MK Tips. Notamos que você saiu da comunidade e queríamos só te avisar: estão chegando novidades por aí — oportunidades novas e um acompanhamento mais organizado.',
  '',
  'Sem pressão nenhuma. Se puder, me conta o que te fez sair? Foi volume de mensagens, conteúdo, horário… qualquer retorno já ajuda a gente melhorar.',
  '',
  'Obrigado pelo tempo que esteve com a gente.',
].join('\n')

function loadConfig() {
  const defaults = {
    message: DEFAULT_MESSAGE,
    delayMs: 25000,
    batchSize: 5,
    postSendWait: '8s',
    stopOnAuthError: true,
  }
  if (!existsSync(recoveryConfigPath)) return defaults
  try {
    return { ...defaults, ...JSON.parse(readFileSync(recoveryConfigPath, 'utf8')) }
  } catch {
    return defaults
  }
}

function phoneKey(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function assertNoLinks(text) {
  if (/https?:\/\/|www\./i.test(text)) {
    throw new Error('Mensagem de recuperação não pode conter links.')
  }
}

async function downloadJson(supabase, path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error || !data) return null
  try {
    return JSON.parse(await data.text())
  } catch {
    return null
  }
}

async function uploadJson(supabase, path, obj) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, JSON.stringify(obj), {
    contentType: 'application/json',
    upsert: true,
  })
  if (error) throw error
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function isAuthOk() {
  try {
    const statusOut = execFileSync(
      wacli,
      ['--account', account, '--read-only', 'auth', 'status', '--json'],
      { encoding: 'utf8', timeout: 20000 },
    )
    const status = JSON.parse(statusOut)
    return Boolean(status?.data?.authenticated ?? status?.authenticated)
  } catch {
    return false
  }
}

function sendDm(to, message, postSendWait) {
  const args = [
    '--account',
    account,
    '--lock-wait',
    '90s',
    'send',
    'text',
    '--to',
    to,
    '--message',
    message,
    '--no-preview',
    '--post-send-wait',
    postSendWait || '8s',
    '--json',
  ]
  return execFileSync(wacli, args, {
    encoding: 'utf8',
    timeout: 120000,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function isFatalSendError(errText) {
  const t = String(errText || '').toLowerCase()
  return (
    t.includes('not authenticated') ||
    t.includes('device jid') ||
    t.includes('error 463') ||
    t.includes('websocket disconnected') ||
    t.includes('not connected')
  )
}

function pickCandidates(items, currentPhones, max) {
  const pending = (items || []).filter((item) => {
    if (item.recovery_status === 'sent' || item.recovery_sent_at) return false
    if (item.recovery_status === 'returned') return false
    if (item.returned_at) return false
    if (currentPhones.has(phoneKey(item.phone))) return false
    if (!includePartial && item.still_in_other_community) return false
    return true
  })

  const byPhone = new Map()
  for (const item of pending) {
    const key = phoneKey(item.phone)
    if (!byPhone.has(key)) byPhone.set(key, item)
  }
  let list = [...byPhone.values()]
  const cap = max > 0 ? max : list.length
  return list.slice(0, cap)
}

async function main() {
  const cfg = loadConfig()
  if (cfg.enabled === false) {
    console.error('Recovery DESLIGADO em config/recovery-message.json (enabled: false).')
    console.error('WhatsApp restringiu a conta — não dispare até estabilizar.')
    process.exit(0)
  }
  const message = String(cfg.message || DEFAULT_MESSAGE).trim()
  assertNoLinks(message)

  if (!limit) limit = Number(cfg.batchSize) || 5

  if (!dryRun) {
    if (!isAuthOk()) {
      console.error('wacli não autenticado. Escaneie o QR e suba o keepalive:')
      console.error('  node scripts/wacli-auth-qr.mjs')
      console.error('  node scripts/wacli-keepalive.mjs')
      process.exit(1)
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Faltam variáveis Supabase no .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  let leaversFile =
    (await downloadJson(supabase, LEAVERS_PATH)) ||
    (existsSync(leaversLocalPath)
      ? JSON.parse(readFileSync(leaversLocalPath, 'utf8'))
      : { items: [] })

  const contactsFile =
    (await downloadJson(supabase, CONTACTS_PATH)) ||
    (existsSync(exportPath) ? JSON.parse(readFileSync(exportPath, 'utf8')) : { rows: [] })

  const currentPhones = new Set((contactsFile.rows || []).map((r) => phoneKey(r.phone)))
  const candidates = pickCandidates(leaversFile.items || [], currentPhones, limit)

  console.log(`Modo: ${dryRun ? 'DRY-RUN' : 'SEND'} · lote ${candidates.length} · delay ${cfg.delayMs}ms`)
  if (candidates.length === 0) {
    console.log('Ninguém pendente.')
    return
  }

  for (const c of candidates) {
    console.log(` - ${c.phone} · ${c.display_name || '—'} · ${c.community_name || c.community_jid}`)
  }

  if (dryRun) {
    console.log('\n--- Mensagem ---\n' + message + '\n----------------')
    return
  }

  let sent = 0
  let failed = 0
  const now = new Date().toISOString()
  const sentPhones = new Set()

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]
    if (!isAuthOk()) {
      console.error('Sessão caiu no meio do lote. Parando para não piorar.')
      console.error('Reconecte: node scripts/wacli-auth-qr.mjs && node scripts/wacli-keepalive.mjs')
      break
    }

    const to = c.phone || c.whatsapp_jid
    try {
      sendDm(to, message, cfg.postSendWait)
      sent += 1
      sentPhones.add(phoneKey(c.phone))
      console.log(`✓ ${to} (${sent}/${candidates.length})`)
    } catch (e) {
      failed += 1
      const errText = e.stderr?.toString?.() || e.message || ''
      console.error(`✗ ${to}:`, errText)
      for (const item of leaversFile.items || []) {
        if (phoneKey(item.phone) === phoneKey(c.phone) && !item.recovery_sent_at) {
          item.recovery_status = 'pending'
          item.recovery_error = String(errText).slice(0, 200)
        }
      }
      if (cfg.stopOnAuthError !== false && isFatalSendError(errText)) {
        console.error('Erro fatal de sessão/rate-limit. Interrompendo o lote.')
        break
      }
    }

    if (i < candidates.length - 1) {
      console.log(`Aguardando ${Math.round(cfg.delayMs / 1000)}s...`)
      await sleep(Number(cfg.delayMs) || 25000)
    }
  }

  for (const item of leaversFile.items || []) {
    if (sentPhones.has(phoneKey(item.phone))) {
      item.recovery_sent_at = now
      item.recovery_status = 'sent'
      item.recovery_error = null
    }
  }

  leaversFile.updatedAt = now
  mkdirSync(dirname(leaversLocalPath), { recursive: true })
  writeFileSync(leaversLocalPath, JSON.stringify(leaversFile, null, 2), 'utf8')
  await uploadJson(supabase, LEAVERS_PATH, leaversFile)

  console.log(`Pronto. Enviados: ${sent} · Falhas/pendentes: ${failed}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Sincroniza participantes das comunidades via wacli (SEM enviar nas comunidades).
 * Detecta quem saiu desde o último sync e grava em leavers (Storage + local).
 *
 * Uso: node --env-file=.env.local scripts/sync-community-contacts.mjs
 */
import { execFileSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const BUCKET = 'mktips-private'
const CONTACTS_PATH = 'community-contacts.json'
const LEAVERS_PATH = 'community-leavers.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const configPath = join(root, 'config', 'auto-pipeline.json')
const exportPath = join(root, 'config', 'community-contacts-export.json')
const leaversLocalPath = join(root, 'config', 'community-leavers.json')

const wacli =
  process.env.WACLI_BIN ||
  join(process.env.LOCALAPPDATA || '', 'wacli', 'wacli.exe')
const account = process.env.WACLI_ACCOUNT || 'me'

function loadTargets() {
  const cfg = JSON.parse(readFileSync(configPath, 'utf8'))
  return cfg.targets || []
}

function groupInfo(jid) {
  const out = execFileSync(
    wacli,
    ['--account', account, '--lock-wait', '180s', 'groups', 'info', '--jid', jid, '--json'],
    { encoding: 'utf8', timeout: 240000 },
  )
  const parsed = JSON.parse(out)
  return parsed.data || parsed
}

function phoneFromParticipant(p) {
  const raw = p.PhoneNumber || p.JID || ''
  const num = String(raw).split('@')[0].replace(/\D/g, '')
  if (!num) return ''
  return num.startsWith('55') ? `+${num}` : `+${num}`
}

function phoneKey(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function sleep(ms) {
  return Promise.resolve().then(
    () =>
      new Promise((r) => {
        setTimeout(r, ms)
      }),
  )
}

async function ensureBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = (buckets || []).some((b) => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false })
    if (error && !/already exists/i.test(error.message)) throw error
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
  const payload = JSON.stringify(obj)
  const { error } = await supabase.storage.from(BUCKET).upload(path, payload, {
    contentType: 'application/json',
    upsert: true,
  })
  if (error) throw error
  return payload
}

function loadLocalContacts() {
  if (!existsSync(exportPath)) return null
  try {
    return JSON.parse(readFileSync(exportPath, 'utf8'))
  } catch {
    return null
  }
}

function loadLocalLeavers() {
  if (!existsSync(leaversLocalPath)) return { items: [] }
  try {
    return JSON.parse(readFileSync(leaversLocalPath, 'utf8'))
  } catch {
    return { items: [] }
  }
}

function membershipKey(phone, communityJid) {
  return `${phoneKey(phone)}|${communityJid}`
}

function detectLeavers(previousRows, currentRows, detectedAt) {
  const current = new Set((currentRows || []).map((r) => membershipKey(r.phone, r.community_jid)))
  const stillInAny = new Set((currentRows || []).map((r) => phoneKey(r.phone)))
  const leavers = []

  for (const row of previousRows || []) {
    const key = membershipKey(row.phone, row.community_jid)
    if (current.has(key)) continue
    leavers.push({
      phone: row.phone,
      display_name: row.display_name || '',
      whatsapp_jid: row.whatsapp_jid || '',
      community_jid: row.community_jid,
      community_name: row.community_name,
      left_at: detectedAt,
      still_in_other_community: stillInAny.has(phoneKey(row.phone)),
      recovery_sent_at: null,
      recovery_status: 'pending',
    })
  }
  return leavers
}

function mergeLeavers(existingItems, fresh) {
  const byKey = new Map()
  for (const item of existingItems || []) {
    byKey.set(membershipKey(item.phone, item.community_jid), item)
  }
  for (const item of fresh) {
    const key = membershipKey(item.phone, item.community_jid)
    if (byKey.has(key)) {
      const prev = byKey.get(key)
      // Se voltou a sair de novo, reabre recuperação só se já tinha sido enviada há muito tempo — mantém histórico
      byKey.set(key, {
        ...prev,
        ...item,
        recovery_sent_at: prev.recovery_sent_at || null,
        recovery_status: prev.recovery_status || 'pending',
        left_at: prev.left_at || item.left_at,
      })
    } else {
      byKey.set(key, item)
    }
  }
  return [...byKey.values()].sort((a, b) => String(b.left_at).localeCompare(String(a.left_at)))
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Faltam variáveis Supabase no .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const targets = loadTargets()
  if (targets.length === 0) {
    console.error('Nenhum target em config/auto-pipeline.json')
    process.exit(1)
  }

  console.log(`Comunidades/grupos a varrer: ${targets.length}`)

  const previous =
    (await downloadJson(supabase, CONTACTS_PATH)) || loadLocalContacts() || { rows: [] }
  const previousRows = Array.isArray(previous.rows) ? previous.rows : []
  console.log(`Snapshot anterior: ${previousRows.length} vínculos`)

  const rows = []
  const syncedAt = new Date().toISOString()

  for (const jid of targets) {
    console.log(`→ ${jid}`)
    try {
      const info = groupInfo(jid)
      const name = info.Name || jid
      const participants = info.Participants || []
      console.log(`   ${name}: ${participants.length} participantes`)

      for (const p of participants) {
        const phone = phoneFromParticipant(p)
        if (!phone || phone.length < 10) continue
        rows.push({
          phone,
          display_name: (p.DisplayName || '').trim(),
          whatsapp_jid: p.PhoneNumber || p.JID || '',
          community_jid: jid,
          community_name: name,
          is_admin: Boolean(p.IsAdmin || p.IsSuperAdmin),
          synced_at: syncedAt,
        })
      }
      await sleep(1200)
    } catch (e) {
      console.error(`   erro:`, e.stderr?.toString() || e.message)
    }
  }

  if (rows.length === 0) {
    console.log('Nenhum contato coletado.')
    process.exit(0)
  }

  const freshLeavers = detectLeavers(previousRows, rows, syncedAt)
  // Quem saiu de TODAS as comunidades alvo (não só de um grupo) — prioridade recovery
  const phoneStillIn = new Set(rows.map((r) => phoneKey(r.phone)))
  const fullExitLeavers = freshLeavers.filter((l) => !phoneStillIn.has(phoneKey(l.phone)))

  const existingLeaversFile =
    (await downloadJson(supabase, LEAVERS_PATH)) || loadLocalLeavers() || { items: [] }
  const mergedLeavers = mergeLeavers(existingLeaversFile.items || [], freshLeavers)

  // Se alguém que estava em leavers voltou a aparecer nos grupos, marca returned
  const currentKeys = new Set(rows.map((r) => membershipKey(r.phone, r.community_jid)))
  for (const item of mergedLeavers) {
    if (currentKeys.has(membershipKey(item.phone, item.community_jid))) {
      item.returned_at = syncedAt
      if (item.recovery_status === 'pending') item.recovery_status = 'returned'
    }
  }

  try {
    await ensureBucket(supabase)
    await uploadJson(supabase, CONTACTS_PATH, { syncedAt, rows })
    await uploadJson(supabase, LEAVERS_PATH, {
      updatedAt: syncedAt,
      items: mergedLeavers,
    })
  } catch (e) {
    console.error('Erro ao salvar no Supabase Storage:', e.message)
    process.exit(1)
  }

  mkdirSync(join(root, 'config'), { recursive: true })
  writeFileSync(exportPath, JSON.stringify({ syncedAt, rows }), 'utf8')
  writeFileSync(
    leaversLocalPath,
    JSON.stringify({ updatedAt: syncedAt, items: mergedLeavers }, null, 2),
    'utf8',
  )

  const { error: tableProbe } = await supabase.from('community_contacts').select('id').limit(1)
  if (!tableProbe) {
    const batchSize = 200
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      await supabase.from('community_contacts').upsert(batch, { onConflict: 'phone,community_jid' })
    }
    console.log('Também sincronizado na tabela community_contacts.')
  }

  const uniquePhones = new Set(rows.map((r) => r.phone))
  console.log(`Salvos ${rows.length} vínculos (${uniquePhones.size} números únicos).`)
  console.log(
    `Saídas detectadas neste sync: ${freshLeavers.length} (saída total das comunidades: ${fullExitLeavers.length})`,
  )
  console.log(`Leavers acumulados: ${mergedLeavers.length}`)
  console.log('Próximo passo recovery: node --env-file=.env.local scripts/recover-community-leavers.mjs --dry-run')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

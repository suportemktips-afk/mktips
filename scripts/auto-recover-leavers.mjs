/**
 * Automação: detecta quem saiu das comunidades.
 * Com recovery desligado (padrão atual): só sync + lista de leavers (SEM enviar DM).
 *
 * Uso:
 *   node --env-file=.env.local scripts/auto-recover-leavers.mjs
 *   node --env-file=.env.local scripts/auto-recover-leavers.mjs --loop
 *   node --env-file=.env.local scripts/auto-recover-leavers.mjs --detect-only
 */
import { spawnSync, execFileSync, spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const recoveryConfigPath = join(root, 'config', 'recovery-message.json')
const pidPath = join(root, 'config', '.wacli-keepalive.pid')
const loop = process.argv.includes('--loop')

const wacli =
  process.env.WACLI_BIN ||
  join(process.env.LOCALAPPDATA || '', 'wacli', 'wacli.exe')
const account = process.env.WACLI_ACCOUNT || 'me'

function loadCfg() {
  const defaults = { delayMs: 25000, batchSize: 5 }
  if (!existsSync(recoveryConfigPath)) return defaults
  try {
    return { ...defaults, ...JSON.parse(readFileSync(recoveryConfigPath, 'utf8')) }
  } catch {
    return defaults
  }
}

function authOk() {
  try {
    const out = execFileSync(
      wacli,
      ['--account', account, '--read-only', 'auth', 'status', '--json'],
      { encoding: 'utf8', timeout: 20000 },
    )
    const parsed = JSON.parse(out)
    return Boolean(parsed?.data?.authenticated ?? parsed?.authenticated)
  } catch {
    return false
  }
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function pauseKeepalive() {
  if (!existsSync(pidPath)) return null
  const pid = Number(readFileSync(pidPath, 'utf8').trim())
  if (!Number.isFinite(pid)) return null
  if (isPidAlive(pid)) {
    try {
      process.kill(pid)
      console.log(`Keepalive pausado (pid ${pid}) para liberar o store.`)
    } catch {
      /* ignore */
    }
  }
  try {
    writeFileSync(pidPath, '', 'utf8')
  } catch {
    /* ignore */
  }
  return pid
}

function resumeKeepalive() {
  if (!authOk()) {
    console.error('Auth offline — não reinicia keepalive. Rode: node scripts/wacli-auth-qr.mjs')
    return
  }
  const r = spawnSync(process.execPath, [join(root, 'scripts', 'wacli-keepalive.mjs')], {
    cwd: root,
    encoding: 'utf8',
  })
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    env: process.env,
  })
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  return r.status === 0
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function cycle() {
  const cfg = loadCfg()
  const detectOnly = process.argv.includes('--detect-only') || cfg.enabled === false
  console.log('\n=== auto-recover', new Date().toISOString(), detectOnly ? '(só detecção)' : '', '===')

  if (!authOk()) {
    console.error('Sessão WhatsApp offline. Conecte o QR:')
    console.error('  node scripts/wacli-auth-qr.mjs')
    return false
  }

  // Libera lock do sync --follow antes de groups info / send
  pauseKeepalive()
  await sleep(2000)

  try {
    console.log('1) Sync comunidades (detecta saídas)...')
    const syncOk = run(process.execPath, [
      '--env-file=.env.local',
      join(root, 'scripts', 'sync-community-contacts.mjs'),
    ])
    if (!syncOk) {
      console.error('Sync falhou.')
      return false
    }

    if (detectOnly) {
      console.log('2) Recovery desligado — só detecção. Lista em CRM WhatsApp → Contatos / community-leavers.json')
      return true
    }

    console.log(`2) Recovery (até ${cfg.batchSize} leads, intervalo ${cfg.delayMs}ms)...`)
    return run(process.execPath, [
      '--env-file=.env.local',
      join(root, 'scripts', 'recover-community-leavers.mjs'),
      '--send',
      '--limit',
      String(cfg.batchSize || 5),
    ])
  } finally {
    console.log('3) Reiniciando keepalive...')
    resumeKeepalive()
  }
}

async function main() {
  if (!loop) {
    const ok = await cycle()
    process.exit(ok ? 0 : 1)
  }

  console.log('Modo loop: sync/detecção a cada 15 min (Ctrl+C para parar)')
  if (loadCfg().enabled === false) {
    console.log('Recovery OFF — nenhuma DM será enviada.')
  }
  for (;;) {
    await cycle()
    console.log('Aguardando 15 minutos (keepalive ativo)...')
    await sleep(15 * 60 * 1000)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

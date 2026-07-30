/**
 * Mantém a sessão wacli viva (sync --follow).
 * Não mata o processo se já estiver autenticado.
 *
 * Uso:
 *   node scripts/wacli-keepalive.mjs
 *   node scripts/wacli-keepalive.mjs --check
 */
import { spawn, execFileSync } from 'child_process'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pidPath = join(root, 'config', '.wacli-keepalive.pid')
const logPath = join(root, 'config', 'wacli-keepalive.log')

const wacli =
  process.env.WACLI_BIN ||
  join(process.env.LOCALAPPDATA || '', 'wacli', 'wacli.exe')
const account = process.env.WACLI_ACCOUNT || 'me'
const checkOnly = process.argv.includes('--check')

function authStatus() {
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

function readPid() {
  if (!existsSync(pidPath)) return null
  const n = Number(readFileSync(pidPath, 'utf8').trim())
  return Number.isFinite(n) ? n : null
}

function appendLog(line) {
  mkdirSync(dirname(logPath), { recursive: true })
  writeFileSync(logPath, `${new Date().toISOString()} ${line}\n`, { flag: 'a' })
}

if (checkOnly) {
  const ok = authStatus()
  const pid = readPid()
  console.log(JSON.stringify({ authenticated: ok, keepalivePid: pid, keepaliveAlive: pid ? isPidAlive(pid) : false }))
  process.exit(ok ? 0 : 1)
}

const existing = readPid()
if (existing && isPidAlive(existing)) {
  console.log(`Keepalive já rodando (pid ${existing}).`)
  if (!authStatus()) {
    console.log('Atenção: processo vivo, mas auth=false. Escaneie QR: node scripts/wacli-auth-qr.mjs')
  } else {
    console.log('Sessão autenticada e estável.')
  }
  process.exit(0)
}

if (!authStatus()) {
  console.error('wacli não autenticado. Conecte o QR primeiro:')
  console.error('  node scripts/wacli-auth-qr.mjs')
  console.error('Depois rode de novo: node scripts/wacli-keepalive.mjs')
  process.exit(1)
}

mkdirSync(dirname(pidPath), { recursive: true })
appendLog('starting sync --follow')

const child = spawn(
  wacli,
  [
    '--account',
    account,
    '--lock-wait',
    '60s',
    'sync',
    '--follow',
    '--presence-mode',
    'quiet',
    '--max-reconnect',
    '0',
    '--stale-threshold',
    '60s',
  ],
  {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  },
)

child.unref()
writeFileSync(pidPath, String(child.pid), 'utf8')
console.log(`Keepalive iniciado (pid ${child.pid}).`)
console.log('A sessão fica ligada em segundo plano. Não feche o PC / não mate o wacli.')
console.log(`Log: ${logPath}`)

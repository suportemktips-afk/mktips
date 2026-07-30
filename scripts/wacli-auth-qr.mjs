/**
 * Gera QR fresco do wacli para vincular o WhatsApp.
 * Uso:
 *   node scripts/wacli-auth-qr.mjs
 *   node scripts/wacli-auth-qr.mjs --phone 5511999999999
 */
import { spawn } from 'child_process'
import { writeFileSync, mkdirSync, createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'config')
const pngPath = join(outDir, 'wacli-qr.png')
const wacli =
  process.env.WACLI_BIN ||
  join(process.env.LOCALAPPDATA || '', 'wacli', 'wacli.exe')
const account = process.env.WACLI_ACCOUNT || 'me'

const phoneIdx = process.argv.indexOf('--phone')
const phone = phoneIdx >= 0 ? String(process.argv[phoneIdx + 1] || '').replace(/\D/g, '') : ''

mkdirSync(outDir, { recursive: true })

function extractQr(line) {
  const cleaned = line.includes('{') ? line.slice(line.indexOf('{')) : line
  try {
    const json = JSON.parse(cleaned)
    if (json.event === 'qr_code' && json.data?.code) return String(json.data.code).replace(/\s+/g, '')
    if (json.event === 'authenticated' || json.event === 'auth_success') return '__AUTH_OK__'
  } catch {
    /* ignore */
  }
  const m = line.match(/https:\/\/wa\.me\/settings\/linked_devices#[^\s"'\\]+/)
  return m ? m[0].replace(/\s+/g, '') : null
}

function downloadQrPng(payload) {
  return new Promise((resolve, reject) => {
    const url =
      'https://api.qrserver.com/v1/create-qr-code/?size=480x480&ecc=M&data=' +
      encodeURIComponent(payload)
    const file = createWriteStream(pngPath)
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(pngPath)))
      })
      .on('error', reject)
  })
}

function openPng() {
  spawn('cmd', ['/c', 'start', '', pngPath], { detached: true, stdio: 'ignore' }).unref()
}

const args = [
  '--account',
  account,
  '--events',
  '--lock-wait',
  '45s',
  'auth',
  '--qr-format',
  'text',
  '--idle-exit',
  '180s',
]
if (phone) {
  args.push('--phone', phone)
  console.log(`Pareamento por número: +${phone}`)
  console.log('Confirme no WhatsApp do celular o código que aparecer.')
} else {
  console.log('Gerando QR… mantenha esta janela aberta até autenticar.')
}

const child = spawn(wacli, args, { stdio: ['ignore', 'pipe', 'pipe'] })
let qrSaved = false
let buffer = ''

async function onLine(line) {
  const code = extractQr(line.trim())
  if (!code) return
  if (code === '__AUTH_OK__') {
    console.log('✓ Autenticado com sucesso!')
    child.kill()
    process.exit(0)
  }
  if (qrSaved || phone) return
  qrSaved = true
  writeFileSync(join(outDir, 'wacli-qr-payload.txt'), code, 'utf8')
  try {
    await downloadQrPng(code)
    console.log('')
    console.log('QR pronto: config/wacli-qr.png')
    console.log('Escaneie AGORA (vale ~1 minuto):')
    console.log('  1. Abra o WhatsApp no CELULAR')
    console.log('  2. Aparelhos conectados → Conectar um aparelho')
    console.log('  3. Escaneie a imagem que abriu (não use a câmera normal)')
    console.log('')
    openPng()
  } catch (e) {
    console.error('Não gerou PNG:', e.message)
    console.log('Payload em config/wacli-qr-payload.txt — me avise se precisar de outro método.')
  }
}

function handleChunk(chunk) {
  buffer += chunk.toString()
  const lines = buffer.split(/\r?\n/)
  buffer = lines.pop() || ''
  for (const line of lines) {
    if (line.trim()) onLine(line)
  }
}

child.stdout.on('data', handleChunk)
child.stderr.on('data', handleChunk)
child.on('exit', (code) => {
  console.log(code === 0 ? 'Auth finalizado.' : `Auth encerrou (código ${code}).`)
  process.exit(code || 0)
})

setTimeout(() => {
  if (!qrSaved && !phone) {
    console.error('Timeout sem QR. Tente parear por número:')
    console.error('  node scripts/wacli-auth-qr.mjs --phone 55SEUNUMERO')
    child.kill()
    process.exit(1)
  }
}, 60000)

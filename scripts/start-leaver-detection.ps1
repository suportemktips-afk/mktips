# MK Tips — só DETECÇÃO de quem saiu (sem enviar mensagem)
# Uso: powershell -ExecutionPolicy Bypass -File scripts/start-leaver-detection.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "Node.js não encontrado no PATH." }

Write-Host ""
Write-Host "=== MK Tips · Detecção de saídas (sem DM) ===" -ForegroundColor Cyan
Write-Host ""

$authJson = & "$env:LOCALAPPDATA\wacli\wacli.exe" --account me auth status --json 2>$null
$authOk = $authJson -match '"authenticated"\s*:\s*true'
if (-not $authOk) {
  Write-Host "WhatsApp offline. Escaneie o QR e rode de novo:" -ForegroundColor Yellow
  Write-Host "  node scripts/wacli-auth-qr.mjs"
  exit 1
}

Write-Host "Sessão OK. Detectando saídas a cada 15 min (sem enviar mensagem)." -ForegroundColor Green
Write-Host "Lista: Admin → CRM WhatsApp → Contatos"
Write-Host "Ctrl+C para parar."
Write-Host ""

& $node --env-file=.env.local "$root\scripts\auto-recover-leavers.mjs" --loop --detect-only

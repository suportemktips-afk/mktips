# MK Tips — estabiliza WhatsApp + recovery automático de quem saiu
# Uso: clique com botão direito → Executar com PowerShell
#  ou: powershell -ExecutionPolicy Bypass -File scripts/start-recovery-automation.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "Node.js não encontrado no PATH." }

Write-Host ""
Write-Host "=== MK Tips · WhatsApp estável + recovery ===" -ForegroundColor Cyan
Write-Host ""

# 1) Auth
Write-Host "1) Checando sessão wacli..."
$authJson = & "$env:LOCALAPPDATA\wacli\wacli.exe" --account me auth status --json 2>$null
$authOk = $authJson -match '"authenticated"\s*:\s*true'
if (-not $authOk) {
  Write-Host "Sessão offline. Abrindo QR — escaneie AGORA no WhatsApp." -ForegroundColor Yellow
  & $node "$root\scripts\wacli-auth-qr.mjs"
  Start-Sleep -Seconds 3
  $authJson = & "$env:LOCALAPPDATA\wacli\wacli.exe" --account me auth status --json 2>$null
  $authOk = $authJson -match '"authenticated"\s*:\s*true'
  if (-not $authOk) {
    Write-Host "Ainda offline. Escaneie o QR em config\wacli-qr.png e rode este script de novo." -ForegroundColor Red
    exit 1
  }
}
Write-Host "Sessão OK." -ForegroundColor Green

# 2) Keepalive
Write-Host "2) Iniciando keepalive (sessão ligada)..."
& $node "$root\scripts\wacli-keepalive.mjs"

# 3) Loop recovery
Write-Host "3) Iniciando automação (sync + recovery a cada 15 min)..." -ForegroundColor Green
Write-Host "   Lote: 5 leads · intervalo: 25s · sem links"
Write-Host "   Deixe esta janela aberta. Ctrl+C para parar."
Write-Host ""

& $node --env-file=.env.local "$root\scripts\auto-recover-leavers.mjs" --loop

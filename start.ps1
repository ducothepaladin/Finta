$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not on PATH. Install Docker Desktop first."
}

Write-Host "Building and starting Finta..." -ForegroundColor Cyan
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

$port = if ($env:APP_PORT) { $env:APP_PORT } else { "8080" }
$url = "http://localhost:$port"

Write-Host ""
Write-Host "Finta is running at $url" -ForegroundColor Green
Write-Host "Stop with: docker compose down" -ForegroundColor DarkGray

Start-Process $url

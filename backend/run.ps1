<#
.SYNOPSIS
    Dev launcher for the Medivoice backend.

    Frees or avoids a busy port, then starts uvicorn with auto-reload.

.EXAMPLE
    .\run.ps1              # port 8000, or the next free one if 8000 is taken
    .\run.ps1 -Port 8010   # force a specific port
#>
param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

function Get-ListenerPids([int]$p) {
    @(Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique)
}

# Find a port nobody is listening on (WinError 10013 / 10048 guard).
$chosen = $Port
for ($i = 0; $i -lt 20; $i++) {
    $pids = Get-ListenerPids $chosen
    if ($pids.Count -eq 0) { break }

    Write-Host "port $chosen is held by PID(s): $($pids -join ', ') -> trying $($chosen + 10)"
    foreach ($pid in $pids) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -match 'python|uvicorn') {
            Write-Host "  stopping stale python server (PID $pid)"
            Stop-Process -Id $pid -Force
        }
    }
    Start-Sleep -Milliseconds 400
    if ((Get-ListenerPids $chosen).Count -eq 0) { break }
    $chosen += 10
}

$venvPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$python = if (Test-Path $venvPython) { $venvPython } else { 'python' }

Write-Host "Medivoice backend -> http://127.0.0.1:$chosen/api/v1/health"
Write-Host "Frontend: set VITE_API_BASE_URL=http://localhost:$chosen/api/v1 (frontend/.env)"
Write-Host ''

& $python -m uvicorn clinivara.main:app --host 127.0.0.1 --port $chosen --reload

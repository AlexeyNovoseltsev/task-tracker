# Синхронизирует Supabase ключи из корневого .env в task-flow-api и task-flow-pro
$Root = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootEnv = Join-Path $Root ".env"
$apiEnv = Join-Path $Root "task-flow-api\.env"
$proEnv = Join-Path $Root "task-flow-pro\.env"

if (-not (Test-Path $rootEnv)) {
  Write-Error "Не найден $rootEnv"
  exit 1
}

$vars = @{}
Get-Content $rootEnv -Encoding UTF8 | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $vars[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$serviceKey = $vars['SUPABASE_SERVICE_KEY']
if (-not $serviceKey) {
  Write-Warning "SUPABASE_SERVICE_KEY пустой в .env"
  Write-Host "Вставь service_role key: https://supabase.com/dashboard/project/vsnxgpaocjuasvbjcudv/settings/api"
  exit 1
}

function Set-EnvValue {
  param([string]$Path, [string]$Key, [string]$Value)

  $lines = Get-Content $Path -Encoding UTF8
  $found = $false
  $escapedKey = [regex]::Escape($Key)

  $newLines = foreach ($line in $lines) {
    if ($line -match "^$escapedKey=") {
      $found = $true
      "$Key=$Value"
    } else {
      $line
    }
  }

  if (-not $found) {
    $newLines += "$Key=$Value"
  }

  Set-Content -Path $Path -Value $newLines -Encoding UTF8
}

Set-EnvValue $apiEnv 'SUPABASE_URL' $vars['SUPABASE_URL']
Set-EnvValue $apiEnv 'SUPABASE_ANON_KEY' $vars['SUPABASE_ANON_KEY']
Set-EnvValue $apiEnv 'SUPABASE_SERVICE_KEY' $serviceKey

Set-EnvValue $proEnv 'VITE_SUPABASE_URL' $vars['SUPABASE_URL']
Set-EnvValue $proEnv 'VITE_SUPABASE_ANON_KEY' $vars['SUPABASE_ANON_KEY']

Write-Host "OK: Supabase env синхронизирован"

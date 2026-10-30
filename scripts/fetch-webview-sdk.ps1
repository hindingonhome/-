param([string]$Output='delivery/webview-sdk')
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'));$folder=Join-Path $root $Output
New-Item -ItemType Directory -Path $folder -Force|Out-Null
$zip=Join-Path $folder 'sdk.zip'
Invoke-WebRequest 'https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/1.0.4314.35/microsoft.web.webview2.1.0.4314.35.nupkg' -OutFile $zip -TimeoutSec 120
if((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne '90778DEB1B77E36292828B4B5833C9255C27533F40E0DDD55891AE718944EDC4'){throw 'WebView2 SDK checksum mismatch'}
Expand-Archive -LiteralPath $zip -DestinationPath (Join-Path $folder 'unpacked') -Force
Write-Output 'Verified Microsoft.Web.WebView2 SDK 1.0.4314.35'

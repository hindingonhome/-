param([ValidateSet('Windows','Linux')][string]$Platform='Windows',[string]$Output='')
$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$version=(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'lite-profile.json') -Raw|ConvertFrom-Json).version
if(!$Output){$Output="release-bundles/lite-$version"}
$outputRoot=[IO.Path]::GetFullPath((Join-Path $repoRoot $Output))
$name="MetalLab-Lite-$version-$Platform-x64";$folder=Join-Path $outputRoot $name
if(Test-Path -LiteralPath $folder){throw "Package staging exists: $folder; choose a fresh Output."}
New-Item -ItemType Directory -Path $folder -Force|Out-Null
if($Platform -eq 'Windows'){$apps=@("MetalLab-Lite-$version-Windows-Portable-x64.exe","MetalLab-Lite-$version-Windows-Setup-x64.exe")}else{$apps=@("MetalLab-Lite-$version-Linux-x64.tar.xz")}
foreach($app in $apps){Copy-Item -LiteralPath (Join-Path $repoRoot "lite-desktop/desktop-dist/$app") -Destination $folder}
Copy-Item -LiteralPath (Join-Path $repoRoot "dist-lite/MetalLab-Lite-$version-Review.html") -Destination (Join-Path $folder "MetalLab-Lite-$version-Offline.html")
foreach($item in @(@('docs/LITE.md','使用说明.md'),@('docs/LITE-CHANGELOG.md','更新日志.md'),@('docs/LITE-ACCEPTANCE.md','验收与检测记录.md'),@('LICENSE','LICENSE'),@('THIRD_PARTY_LICENSE.txt','THIRD_PARTY_LICENSE.txt'))){Copy-Item -LiteralPath (Join-Path $repoRoot $item[0]) -Destination (Join-Path $folder $item[1])}
$icons=Join-Path $folder 'Lite图标';New-Item -ItemType Directory -Path $icons|Out-Null
foreach($ext in @('svg','png','ico')){Copy-Item -LiteralPath (Join-Path $repoRoot "src/assets/lite-icon.$ext") -Destination $icons}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=Join-Path $outputRoot ($name+'.zip')
[IO.Compression.ZipFile]::CreateFromDirectory($folder,$zip,[IO.Compression.CompressionLevel]::Optimal,$true)
Write-Output "$((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($zip))"

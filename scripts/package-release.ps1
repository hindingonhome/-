param([ValidateSet('Windows','Linux')][string]$Platform='Windows',[string]$Output='release-bundles')
$ErrorActionPreference='Stop'
$version=(Get-Content -LiteralPath (Join-Path $PSScriptRoot '../package.json') -Raw|ConvertFrom-Json).version
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputRoot=[IO.Path]::GetFullPath((Join-Path $repoRoot $Output))
$name="MetalLab-$version-$Platform-x64"
$folder=Join-Path $outputRoot $name
if(Test-Path -LiteralPath $folder){throw "Package staging already exists: $folder; choose a fresh Output directory."}
New-Item -ItemType Directory -Path $folder -Force|Out-Null
if($Platform -eq 'Windows'){$apps=@("MetalLab-$version-Windows-Portable-x64.exe","MetalLab-$version-Windows-Setup-x64.exe")}else{$apps=@("MetalLab-$version-Linux-x64.tar.xz")}
foreach($app in $apps){Copy-Item -LiteralPath (Join-Path $repoRoot "desktop-dist/$app") -Destination $folder}
Copy-Item -LiteralPath (Join-Path $repoRoot 'dist/金属工坊.html') -Destination (Join-Path $folder "MetalLab-$version-Offline.html")
foreach($doc in @('README.md','CHANGELOG.md','LICENSE','THIRD_PARTY_LICENSE.txt')){Copy-Item -LiteralPath (Join-Path $repoRoot $doc) -Destination $folder}
Copy-Item -LiteralPath (Join-Path $repoRoot 'docs/V1.1.0-ACCEPTANCE.md') -Destination (Join-Path $folder '使用与验收说明.md')
Copy-Item -LiteralPath (Join-Path $repoRoot 'examples/multi-model-workspace.mlab') -Destination (Join-Path $folder '示例工程-30模型150记录.mlab')
$zip=Join-Path $outputRoot ($name+'.zip')
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($folder,$zip,[IO.Compression.CompressionLevel]::Optimal,$true)
$hash=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Output "$hash  $([IO.Path]::GetFileName($zip))"

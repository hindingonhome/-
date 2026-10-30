param([ValidateSet('Standard','Lite')][string]$Edition,[string]$Output='release-bundles/small-20261030')
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'));$out=Join-Path $root $Output
if($Edition -eq 'Standard'){$version=(Get-Content (Join-Path $root 'package.json') -Raw|ConvertFrom-Json).version;$stage=Join-Path $root 'standard-slim-dist';$name="MetalLab-$version";$guide='docs/STANDARD-SLIM.md';$tag="V$version"}else{$version=(Get-Content (Join-Path $root 'scripts/lite-profile.json') -Raw|ConvertFrom-Json).version;$stage=Join-Path $root 'slim-dist';$name="MetalLab-Lite-$version";$guide='docs/LITE-SLIM.md';$tag="Lite-V$version"}
New-Item -ItemType Directory -Path $out -Force|Out-Null
$folder=Join-Path $out "$name-Windows-x64";if(Test-Path $folder){throw 'Choose fresh package output'}
New-Item -ItemType Directory -Path $folder|Out-Null
Get-ChildItem -LiteralPath $stage -Force|Where-Object {$_.Extension -notin @('.cs','.md')}|ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination $folder -Recurse -Force}
Copy-Item -LiteralPath (Join-Path $root $guide) -Destination (Join-Path $folder '使用说明.md') -Force
Copy-Item -LiteralPath (Join-Path $root 'CHANGELOG.md') -Destination $folder
Copy-Item -LiteralPath (Join-Path $root 'docs/MANUAL.html') -Destination (Join-Path $folder '软件使用说明.html')
if($Edition -eq 'Lite'){Copy-Item -LiteralPath (Join-Path $root 'docs/LITE.md') -Destination $folder;Copy-Item -LiteralPath (Join-Path $root 'docs/LITE-CHANGELOG.md') -Destination $folder}
Copy-Item -LiteralPath (Join-Path $root "docs/releases/$tag.md") -Destination (Join-Path $folder '本版发布说明.md')
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=Join-Path $out "$name-Windows-x64.zip";[IO.Compression.ZipFile]::CreateFromDirectory($folder,$zip,[IO.Compression.CompressionLevel]::Optimal,$true)
$files=@($zip)
if($Edition -eq 'Lite'){
 $webFolder=Join-Path $out "$name-iPhone-Web";New-Item -ItemType Directory -Path $webFolder|Out-Null
 Get-ChildItem -LiteralPath (Join-Path $root 'site-lite') -Force|ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination $webFolder -Recurse -Force}
 foreach($doc in @('docs/IPHONE.md','docs/LITE-CHANGELOG.md','LICENSE','THIRD_PARTY_LICENSE.txt')){Copy-Item -LiteralPath (Join-Path $root $doc) -Destination $webFolder}
 Copy-Item -LiteralPath (Join-Path $root 'docs/MANUAL.html') -Destination (Join-Path $webFolder '软件使用说明.html')
 $webZip=Join-Path $out "$name-iPhone-Web.zip";[IO.Compression.ZipFile]::CreateFromDirectory($webFolder,$webZip,[IO.Compression.CompressionLevel]::Optimal,$true);$files+=$webZip
}
$hashes=$files|ForEach-Object {"$((Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($_))"}
$checksum=Join-Path $out "$tag-SHA256SUMS.txt";[IO.File]::WriteAllLines($checksum,$hashes,[Text.UTF8Encoding]::new($false))
$hashes

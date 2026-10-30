param([string]$Sdk='delivery/webview-sdk/unpacked',[string]$Output='slim-dist',[ValidateSet('Lite','Standard')][string]$Edition='Lite')
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'));$out=[IO.Path]::GetFullPath((Join-Path $root $Output));$sdkRoot=[IO.Path]::GetFullPath((Join-Path $root $Sdk))
New-Item -ItemType Directory -Path (Join-Path $out 'web') -Force|Out-Null
foreach($name in @('Core','WinForms')){Copy-Item -LiteralPath (Join-Path $sdkRoot "lib/net462/Microsoft.Web.WebView2.$name.dll") -Destination $out}
Copy-Item -LiteralPath (Join-Path $sdkRoot 'runtimes/win-x64/native/WebView2Loader.dll') -Destination $out
$icon='src/assets/lite-icon.ico';$html='dist-web-lite/MetalLab-Lite-1.1.0-Review.html';$exe='MetalLab-Lite-Slim.exe'
if($Edition -eq 'Standard'){$icon='desktop/icon.ico';$html='dist-web-base/金属工坊.html';$exe='MetalLab-Standard-Slim.exe'}
Copy-Item -LiteralPath (Join-Path $root $icon) -Destination (Join-Path $out 'Lite.ico')
Copy-Item -LiteralPath (Join-Path $root $html) -Destination (Join-Path $out 'web/index.html')
Copy-Item -LiteralPath (Join-Path $sdkRoot 'LICENSE.txt') -Destination (Join-Path $out 'WebView2-LICENSE.txt')
Copy-Item -LiteralPath (Join-Path $sdkRoot 'NOTICE.txt') -Destination (Join-Path $out 'WebView2-NOTICE.txt')
foreach($file in @('LICENSE','THIRD_PARTY_LICENSE.txt')){Copy-Item -LiteralPath (Join-Path $root $file) -Destination $out}
$compiler=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
$version=(Get-Content -LiteralPath (Join-Path $root 'scripts/lite-profile.json') -Raw|ConvertFrom-Json).version
$source=Join-Path $root 'desktop/slim/Program.cs';$code=[IO.File]::ReadAllText($source)
if($Edition -eq 'Standard'){
 $version=(Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw|ConvertFrom-Json).version
 $code=$code.Replace('MetalLab Lite','MetalLab Standard').Replace('metallab-lite','metallab-standard').Replace('MetalLabLiteSlim','MetalLabStandardSlim').Replace('9227','9228')
}
$code=$code.Replace('· Slim Preview',"v$version · WebView2")
$attributes="[assembly: System.Reflection.AssemblyVersion(`"$version.0`")]`n[assembly: System.Reflection.AssemblyFileVersion(`"$version.0`")]`n"
$code=$code.Replace('internal sealed class LiteWindow',$attributes+'internal sealed class LiteWindow')
$source=Join-Path $out 'Program.generated.cs';[IO.File]::WriteAllText($source,$code,[Text.UTF8Encoding]::new($false))
& $compiler /nologo /target:winexe /platform:x64 /optimize+ "/win32icon:$out/Lite.ico" "/out:$out/$exe" /r:System.Windows.Forms.dll /r:System.Drawing.dll "/r:$out/Microsoft.Web.WebView2.Core.dll" "/r:$out/Microsoft.Web.WebView2.WinForms.dll" $source
if($LASTEXITCODE -ne 0){throw 'Slim compilation failed'}
Write-Output "Slim Windows preview built: $out"

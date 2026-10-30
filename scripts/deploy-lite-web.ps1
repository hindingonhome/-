$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$site=Join-Path $repoRoot 'site-lite';if(!(Test-Path -LiteralPath (Join-Path $site 'index.html'))){throw 'Run pnpm build:lite:web first'}
$stage=Join-Path $repoRoot 'delivery/pages-publish';New-Item -ItemType Directory -Path $stage -Force|Out-Null
$remote=(git -C $repoRoot remote get-url origin).Trim()
if(!(Test-Path -LiteralPath (Join-Path $stage '.git'))){
 git -C $stage init -b gh-pages|Out-Null;if($LASTEXITCODE -ne 0){throw 'Pages git init failed'}
 git -C $stage remote add origin $remote
 $author=Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw|ConvertFrom-Json
 git -C $stage config user.name 'CHAMBER'
 git -C $stage config user.email '97101yy@gmail.com'
 $existing=git -C $repoRoot ls-remote --heads origin gh-pages
 if($LASTEXITCODE -ne 0){throw 'Cannot inspect gh-pages branch'}
 if($existing){git -C $stage fetch origin gh-pages;if($LASTEXITCODE -ne 0){throw 'Pages fetch failed'};git -C $stage checkout -B gh-pages FETCH_HEAD;if($LASTEXITCODE -ne 0){throw 'Pages checkout failed'}}
}
Get-ChildItem -LiteralPath $site -Force|ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force}
git -C $stage add --all;if($LASTEXITCODE -ne 0){throw 'Pages staging failed'}
git -C $stage diff --cached --quiet
if($LASTEXITCODE -eq 1){git -C $stage commit -m 'Deploy reviewed MetalLab Lite phone web preview';if($LASTEXITCODE -ne 0){throw 'Pages commit failed'}}elseif($LASTEXITCODE -ne 0){throw 'Cannot inspect staged Pages changes'}
git -C $stage -c http.version=HTTP/1.1 push origin gh-pages;if($LASTEXITCODE -ne 0){throw 'Pages push failed; no force update attempted'}
$env:GIT_TERMINAL_PROMPT='0';$env:GCM_INTERACTIVE='Never'
$lines="protocol=https`nhost=github.com`n`n"|git -C $repoRoot credential fill 2>$null
$secret=$lines|Where-Object {$_ -like 'password=*'}|Select-Object -First 1;if(!$secret){throw 'Authentication unavailable'}
$headers=@{Authorization=('Bearer '+$secret.Substring(9));Accept='application/vnd.github+json'};$api='https://api.github.com/repos/hindingonhome/-'
try{$pages=Invoke-RestMethod "$api/pages" -Headers $headers -TimeoutSec 30}catch{if([int]$_.Exception.Response.StatusCode -ne 404){throw};$pages=$null}
if(!$pages){$data='{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}';$pages=Invoke-RestMethod "$api/pages" -Headers $headers -Method Post -ContentType 'application/json' -Body $data -TimeoutSec 30}elseif($pages.source.branch -ne 'gh-pages' -or $pages.source.path -ne '/') {throw 'Existing Pages source differs; not overwriting it'}
Write-Output "Pages configured: $($pages.html_url) status=$($pages.status)"

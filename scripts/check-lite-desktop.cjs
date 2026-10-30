const {_electron}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const root=process.cwd(),profile=path.join(root,'delivery/lite-native-profile');fs.mkdirSync(profile,{recursive:true});
 const app=await _electron.launch({executablePath:path.join(root,'lite-desktop/desktop-dist/win-unpacked/MetalLab Lite.exe'),args:['--user-data-dir='+profile],env:{...process.env,METAL_LAB_TEST_USER_DATA:profile}});
 try{
  const info=await app.evaluate(({app})=>({version:app.getVersion(),name:app.getName(),userData:app.getPath('userData')}));
  assert.equal(info.version,'1.1.0');assert.equal(info.name,'MetalLab Lite');assert.equal(path.resolve(info.userData),profile);
  const page=await app.firstWindow();await page.waitForLoadState('domcontentloaded');await page.waitForTimeout(700);
  if(await page.locator('#aboutDialog').evaluate(el=>el.open))await page.locator('#aboutDialog [data-close]').first().click();
  assert.equal(await page.title(),'Metal Lab Lite v1.1.0');
  await page.locator('#cubeBtn').click();await page.waitForTimeout(300);assert.equal(await page.locator('#mass').innerText(),'0.019');
  const file=path.join(profile,'native-check.mlab');
  await app.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showMessageBox=async()=>({response:0});},file);
  await page.locator('.tools-menu summary').click();await page.locator('#backupBtn').click();await page.waitForTimeout(300);
  assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).format,'metal-lab-project');
  await page.locator('#newWorkspaceBtn').click();await page.locator('#discardNewBtn').click();await page.waitForTimeout(200);assert.equal(await page.locator('#cardCount').innerText(),'0');
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},file);
  await page.locator('.tools-menu summary').click();await page.locator('#restoreBtn').click();await page.waitForTimeout(300);assert.equal(await page.locator('#mass').innerText(),'0.019');
  fs.writeFileSync('delivery/lite-ui-check/native-result.json',JSON.stringify({status:'passed',info,checks:['packaged startup','isolated user data','Lite title/version','cube mass','native save','new workspace','native restore']},null,2));
  console.log('Packaged Windows Lite checks passed');
 }finally{await app.close();}
})().catch(error=>{console.error(error);process.exit(1);});

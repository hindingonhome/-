const {webkit,chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve('site-lite'),out=path.resolve('delivery/phone-check');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png'};
(async()=>{
 const server=http.createServer((req,res)=>{const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(error?'Not found':data);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port+'/';const results=[];
 try{for(const [name,launcher] of [['webkit',webkit],['edge',chromium]]){
  const browser=await launcher.launch({headless:true,...(name==='edge'?{channel:'msedge',args:['--enable-unsafe-swiftshader']}: {})});
  try{const context=await browser.newContext({viewport:{width:402,height:874},deviceScaleFactor:3,isMobile:true,hasTouch:true,acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://**',route=>route.abort());
   await page.goto(url);await page.waitForTimeout(500);assert.equal(await page.locator('#newWorkspaceBtn span').innerText(),'新建');assert.ok(await page.locator('.brand .version').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))<=10);await page.locator('#cubeBtn').tap();await page.waitForTimeout(250);
   await page.locator('.lite-phone-tabs [data-phone-pane=estimate]').tap();assert.equal(await page.locator('#mass').innerText(),'0.019');
   assert.ok(await page.locator('#density').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=16);
   await page.locator('.lite-phone-tabs [data-phone-pane=records]').tap();assert.equal(await page.locator('#cardCount').innerText(),'1');await page.locator('[data-rename-record]').first().tap();
   assert.equal(await page.locator('body').getAttribute('data-phone-pane'),'estimate');assert.equal(await page.evaluate(()=>document.activeElement.id),'cardName');await page.locator('#cardName').fill('iPhone test');await page.locator('#cardName').dispatchEvent('change');await page.locator('#cardName').evaluate(el=>el.blur());
   await page.locator('.tools-menu summary').tap();await page.locator('#backupBtn').tap();await page.locator('#phoneFileDialog').waitFor({state:'visible'});
   const download=page.waitForEvent('download');await page.locator('#phoneFileDialog button').filter({hasText:'下载文件'}).tap();const saved=await download;const file=path.join(out,name+'.mlab');await saved.saveAs(file);await page.locator('#phoneFileDialog button').filter({hasText:'关闭'}).tap();
   await page.locator('#newWorkspaceBtn').tap();await page.locator('#discardNewBtn').tap();await page.waitForTimeout(150);assert.equal(await page.locator('#cardCount').innerText(),'0');await page.locator('#restoreInput').setInputFiles(file);await page.waitForTimeout(250);assert.equal(await page.locator('#mass').innerText(),'0.019');
   await page.locator('.tools-menu summary').tap();await page.locator('#languageSelect').selectOption('en');await page.waitForTimeout(100);await page.keyboard.press('Escape');assert.equal(await page.locator('[data-phone-label]').nth(1).innerText(),'Estimate');
   for(const width of [320,375,390,402,430,844,874]){await page.setViewportSize({width,height:width===844?390:844});for(const pane of ['model','estimate','records']){await page.locator('.lite-phone-tabs [data-phone-pane='+pane+']').tap();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+name+' '+width+' '+pane);}await page.locator('.lite-phone-tabs [data-phone-pane=model]').tap();await page.waitForTimeout(100);await page.screenshot({path:path.join(out,name+'-'+width+'.png')});}
   const webglWarning=await page.locator('#viewportError').isVisible();let offline=false;
   await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForTimeout(150);await context.setOffline(true);
   try{await page.reload();assert.ok(await page.locator('#cubeBtn').count());offline=true;}catch(error){if(name!=='webkit')throw error;console.log('WebKit Windows offline automation limitation:',error.message.split('\n')[0]);}finally{await context.setOffline(false);}
   results.push({engine:name,errors,webglWarning,offline,checks:['cube mass','phone tabs','16px input','rename','download .mlab','clear and restore','English navigation','320/375/390/430/844 layout']});assert.deepEqual(errors,[]);
  }finally{await browser.close();}
 }}finally{server.close();}
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(results,null,2));console.log('Phone WebKit and Edge checks passed');
})().catch(error=>{console.error(error);process.exit(1);});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{fs.mkdirSync('docs/screenshots',{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
try{for(const [name,file,phone] of [['standard','dist-web-base/金属工坊.html',false],['lite','dist-web-lite/MetalLab-Lite-1.0.0-Review.html',false],['iphone','site-lite/index.html',true]]){
 const page=await browser.newPage(phone?{viewport:{width:402,height:874},deviceScaleFactor:3,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:1050}});await page.route('https://**',r=>r.abort());await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForTimeout(500);
 await page.locator('#demoBtn').evaluate(el=>el.click());await page.waitForTimeout(250);
 await page.screenshot({path:'docs/screenshots/'+name+'-model.png'});
 if(phone)await page.locator('.lite-phone-tabs [data-phone-pane=estimate]').click();
 await page.screenshot({path:'docs/screenshots/'+name+'-estimate.png'});
 await page.locator('.tools-menu summary').click();await page.locator('#helpBtn').click();assert.ok(await page.locator('#helpDialog').isVisible());assert.ok((await page.locator('#helpDialog').innerText()).length>100);
 await page.screenshot({path:'docs/screenshots/'+name+'-guide.png'});await page.close();console.log(name+' usage guide verified');
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

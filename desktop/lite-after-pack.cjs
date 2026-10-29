const path=require('node:path');
const {execFileSync}=require('node:child_process');
module.exports=async context=>{
 await require('./after-pack.cjs')(context);
 if(context.electronPlatformName==='win32'){
  const editor=require.resolve('electron-winstaller/vendor/rcedit.exe',{paths:[require.resolve('electron-builder')]});
  const exe=path.join(context.appOutDir,context.packager.appInfo.productFilename+'.exe');
  execFileSync(editor,[exe,'--set-icon',path.join(__dirname,'icon.ico'),'--set-version-string','ProductName','MetalLab Lite','--set-version-string','FileDescription','MetalLab Lite','--set-file-version',context.packager.appInfo.version,'--set-product-version',context.packager.appInfo.version]);
 }
};

import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),stage=path.resolve('lite-desktop');
const profile=JSON.parse(await fs.readFile('scripts/lite-profile.json','utf8'));
await fs.mkdir(stage+'/desktop',{recursive:true});await fs.mkdir(stage+'/dist',{recursive:true});
try{await fs.lstat(stage+'/node_modules');}catch(error){if(error.code!=='ENOENT')throw error;await fs.symlink(path.join(root,'node_modules'),stage+'/node_modules',process.platform==='win32'?'junction':'dir');}
for(const file of ['preload.cjs','project-files.cjs','installer-icons.nsh','after-pack.cjs','lite-after-pack.cjs'])await fs.copyFile('desktop/'+file,stage+'/desktop/'+file);
for(const ext of ['png','ico'])await fs.copyFile('src/assets/lite-icon.'+ext,stage+'/desktop/icon.'+ext);
await fs.copyFile('dist-lite/MetalLab-Lite-'+profile.version+'-Review.html',stage+'/dist/金属工坊.html');
let main=await fs.readFile('desktop/main.cjs','utf8');
main=main.replace("const htmlPath =", "app.setName('MetalLab Lite');\nif(!process.env.METAL_LAB_TEST_USER_DATA)app.setPath('userData',path.join(app.getPath('appData'),'MetalLab Lite'));\nconst htmlPath =")
 .replaceAll('cn.metallab.desktop','cn.metallab.lite').replace("title: '金属工坊',","title: 'MetalLab Lite',")
 .replace('minWidth: 1040','minWidth: 640').replace('minHeight: 680','minHeight: 560').replace("backgroundColor: '#24262a'","backgroundColor: '#edf0f3'");
await fs.writeFile(stage+'/desktop/main.cjs',main);
const base=JSON.parse(await fs.readFile('package.json','utf8'));
const build={...base.build,npmRebuild:false,appId:'cn.metallab.lite',productName:'MetalLab Lite',electronLanguages:['en-US','zh-CN','zh-TW'],directories:{output:'desktop-dist'},files:['desktop/main.cjs','desktop/preload.cjs','desktop/project-files.cjs','desktop/icon.ico','desktop/icon.png','dist/金属工坊.html','package.json'],portable:{artifactName:'MetalLab-Lite-${version}-Windows-Portable-${arch}.${ext}'},nsis:{...base.build.nsis,artifactName:'MetalLab-Lite-${version}-Windows-Setup-${arch}.${ext}'},linux:{...base.build.linux,artifactName:'MetalLab-Lite-${version}-Linux-${arch}.${ext}'}};
delete build.fileAssociations;delete build.mac;
build.afterPack=path.join(stage,'desktop/lite-after-pack.cjs');
build.win={...build.win,icon:path.join(stage,'desktop/icon.ico')};
build.linux.icon=path.join(stage,'desktop/icon.png');
Object.assign(build.nsis,{include:path.join(stage,'desktop/installer-icons.nsh'),installerIcon:path.join(stage,'desktop/icon.ico'),uninstallerIcon:path.join(stage,'desktop/icon.ico')});
build.extraFiles=[{from:path.join(stage,'desktop/icon.ico'),to:'MetalLab-brand.ico'}];
await fs.writeFile(stage+'/package.json',JSON.stringify({name:'metal-lab-lite',version:profile.version,packageManager:base.packageManager,private:true,description:'MetalLab Lite · model volume and metal weight estimates',author:base.author,main:'desktop/main.cjs',devDependencies:{electron:base.devDependencies.electron},build},null,2)+'\n');
console.log('Lite desktop stage:',stage,'; Standard files unchanged');

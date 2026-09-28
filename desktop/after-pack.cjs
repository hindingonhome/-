const fs=require('node:fs/promises');
const path=require('node:path');

const keep=new Set(['en-US.pak','zh-CN.pak','zh-TW.pak']);
const unusedWebGpuModules=['dxcompiler.dll','dxil.dll'];

async function pruneLocales(appOutDir,allowedRoot=path.join(__dirname,'..','desktop-dist')){
  const output=path.resolve(appOutDir),root=path.resolve(allowedRoot);
  if(!output.startsWith(root+path.sep))throw Error('Package directory is outside the expected output root');
  const localeDir=path.join(output,'locales');
  const entries=await fs.readdir(localeDir,{withFileTypes:true});
  let removed=0,bytes=0;
  for(const entry of entries){
    if(!entry.isFile()||!entry.name.endsWith('.pak')||keep.has(entry.name))continue;
    const file=path.join(localeDir,entry.name),stat=await fs.stat(file);
    await fs.unlink(file);removed++;bytes+=stat.size;
  }
  const removedModules=[];
  for(const name of unusedWebGpuModules){
    const file=path.join(output,name);
    try{const stat=await fs.stat(file);if(!stat.isFile())continue;await fs.unlink(file);removedModules.push(name);bytes+=stat.size;}
    catch(error){if(error.code!=='ENOENT')throw error;}
  }
  console.log(`Removed ${removed} unused locale packs and ${removedModules.join(', ')||'no'} WebGPU modules; saved ${(bytes/1048576).toFixed(1)} MiB unpacked.`);
  return {removed,removedModules,bytes};
}

module.exports=async context=>['win32','linux'].includes(context.electronPlatformName)?pruneLocales(context.appOutDir):undefined;
module.exports.pruneLocales=pruneLocales;

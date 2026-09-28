import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {pruneLocales}=require('../desktop/after-pack.cjs');

test('packaging keeps required WebGL files and prunes unused locales and WebGPU modules',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'metal-lab-pack-'));
  try{
    const out=path.join(root,'win-unpacked'),locales=path.join(out,'locales');
    await fs.mkdir(locales,{recursive:true});
    for(const name of ['en-US.pak','zh-CN.pak','fr.pak','notes.txt'])await fs.writeFile(path.join(locales,name),name);
    for(const name of ['dxcompiler.dll','dxil.dll','d3dcompiler_47.dll'])await fs.writeFile(path.join(out,name),name);
    const result=await pruneLocales(out,root);
    assert.equal(result.removed,1);
    assert.deepEqual((await fs.readdir(locales)).sort(),['en-US.pak','notes.txt','zh-CN.pak']);
    assert.deepEqual(result.removedModules,['dxcompiler.dll','dxil.dll']);
    assert.deepEqual((await fs.readdir(out)).filter(name=>name.endsWith('.dll')),['d3dcompiler_47.dll']);
    await assert.rejects(()=>pruneLocales(root,path.join(root,'other')),/outside/);
  }finally{
    const resolved=path.resolve(root),prefix=path.resolve(os.tmpdir())+path.sep+'metal-lab-pack-';
    if(!resolved.startsWith(prefix))throw Error('Unexpected temporary cleanup path');
    await fs.rm(resolved,{recursive:true,force:true});
  }
});

import {create} from 'tar';
import {spawn} from 'node:child_process';
import {stat,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// On Windows, electron-builder's tar target loses Unix executable bits.
// Repack its already-built Linux directory with explicit modes before sharing.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'desktop-dist');
const sevenZip=process.env.SEVEN_ZA;
if(!sevenZip)throw new Error('Set SEVEN_ZA to the 7za executable used for xz compression.');
const folder='MetalLab-1.0.0-Linux-x64';
const tarPath=path.join(output,`${folder}.tar`);
const archive=path.join(output,`${folder}-executable.tar.xz`);
const executable=new Set(['metal-lab-desktop','chrome_crashpad_handler','chrome-sandbox']);

await create({
  cwd:path.join(output,'linux-unpacked'),
  file:tarPath,
  prefix:folder,
  portable:true,
  filter:(name,entry)=>{
    const bits=entry.isDirectory()?0o755:executable.has(path.basename(name))?0o755:0o644;
    entry.mode=(entry.mode&~0o7777)|bits;
    return true;
  }
},['.']);

await new Promise((resolve,reject)=>{
  const child=spawn(sevenZip,['a','-txz',archive,tarPath,'-mx=9','-y'],{stdio:'inherit'});
  child.once('error',reject);
  child.once('exit',code=>code===0?resolve():reject(new Error(`7za exited ${code}`)));
});
await unlink(tarPath);
const size=(await stat(archive)).size;
if(size>=100_000_000)throw new Error(`Linux package exceeds 100 MB: ${size} bytes`);
console.log(`Linux archive ready: ${archive} (${size} bytes)`);

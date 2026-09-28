import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'mobile-web');
await mkdir(target,{recursive:true});
await copyFile(path.join(root,'dist','金属工坊.html'),path.join(target,'index.html'));
console.log('Prepared offline mobile web assets.');

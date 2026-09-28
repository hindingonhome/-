import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';import os from 'node:os';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {isProjectPath,addRecent,nextAvailableProjectPath}=require('../desktop/project-files.cjs');
const project=name=>path.join(os.tmpdir(),'metal-lab-project-tests',name);
test('desktop recognizes only dedicated project extension and keeps recents unique',()=>{const file=project('a.mlab');assert.equal(isProjectPath(file),true);assert.equal(isProjectPath(project('a.json')),false);assert.deepEqual(addRecent([file,project('b.mlab')],file).map(x=>path.basename(x)),['a.mlab','b.mlab']);});
test('Save As suggests ZBrush-style sequential names without stacking suffixes',async()=>{
 const file=project('戒指.mlab');const existing=new Set([file,project('戒指_001.mlab')]);
 const exists=async candidate=>existing.has(candidate);
 assert.equal(path.basename(await nextAvailableProjectPath(file,exists)),'戒指_002.mlab');
 assert.equal(path.basename(await nextAvailableProjectPath(project('戒指_001.mlab'),exists)),'戒指_002.mlab');
});

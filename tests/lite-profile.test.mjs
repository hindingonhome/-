import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

test('Lite delivery restricts languages and removes disabled feature entry points',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'metallab-lite-'));
 try {
  // A clean checkout has no ignored dist/. Build in the test's own temp tree.
  const shared=path.join(out,'standard');
  execFileSync(process.execPath,['build.mjs',shared]);
  execFileSync(process.execPath,['scripts/build-lite.mjs',out,path.join(shared,'金属工坊.html')]);
  const html=fs.readFileSync(path.join(out,'MetalLab-Lite-1.0.0-Review.html'),'utf8');
  const language=html.match(/<select id="languageSelect"[^>]*>(.*?)<\/select>/s)[1];
  assert.deepEqual([...language.matchAll(/value="([^"]+)"/g)].map(m=>m[1]),['zh-CN','zh-TW','en']);
  assert.doesNotMatch(html, /id="lite(?:Models|Advanced|Theme)"/);
  assert.match(html,/id="liteModelSelect"/);
  assert.match(html,/data-lite-profile/);
  assert.match(html,/data-lite-icon/);
  const examples=html.match(/<div class="lite-examples"[^>]*>(.*?)<\/div>/s);
  assert.ok(examples,'sample controls are visible above records');
  assert.match(examples[1],/id="demoBtn"/);
  assert.match(examples[1],/id="cubeBtn"/);
  assert.equal([...html.matchAll(/id="demoBtn"/g)].length,1);
  assert.equal([...html.matchAll(/id="cubeBtn"/g)].length,1);
  assert.ok(html.indexOf('class="lite-examples"')<html.indexOf('id="recordsPanel"'));
 } finally {fs.rmSync(out,{recursive:true,force:true});}
});

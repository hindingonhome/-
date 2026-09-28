import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Windows release builds portable and installer artifacts with project association',()=>{
 const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url)));
 const targets=pkg.build.win.target.map(row=>typeof row==='string'?row:row.target);
 assert.deepEqual(targets,['portable','nsis']);
 assert.match(pkg.build.portable.artifactName,/Portable/);
 assert.match(pkg.build.nsis.artifactName,/Setup/);
 assert.ok(pkg.build.fileAssociations.some(row=>row.ext==='mlab'&&row.icon==='desktop/icon.ico'));
});

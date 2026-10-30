import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Lite has an independent build and keeps the shared calculation engine',()=>{assert.ok(fs.existsSync(new URL('../scripts/build-lite.mjs',import.meta.url)));});

test('Lite has its own version and bounded menus',()=>{const s=fs.readFileSync(new URL('../scripts/build-lite.mjs',import.meta.url),'utf8'),profile=fs.readFileSync(new URL('../scripts/lite-profile.mjs',import.meta.url),'utf8');assert.match(s,/Lite v1\.1\.0/);assert.match(s,/overflow-y:auto/);assert.match(profile,/menu.open=false/);assert.match(s,/lite-about-heading/);});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Standard UI and release notes match package version',()=>{
 const version=JSON.parse(fs.readFileSync('package.json','utf8')).version,html=fs.readFileSync('src/index.html','utf8');
 assert.ok(html.includes('<span class="version">'+version+'</span>'));assert.ok(html.includes('VERSION '+version));assert.ok(fs.existsSync('docs/releases/V'+version+'.md'));
 const lite=JSON.parse(fs.readFileSync('scripts/lite-profile.json','utf8')).version;assert.ok(fs.existsSync('docs/releases/Lite-V'+lite+'.md'));
});

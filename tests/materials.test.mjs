import test from 'node:test';
import assert from 'node:assert/strict';
import {materials,otherMetalKeys} from '../src/materials.mjs';

test('common casting metals have editable density presets without invented market prices',()=>{
 assert.equal(materials.aluminum.density,2.7);
 assert.equal(materials.tin.density,7.287);
 assert.ok(otherMetalKeys.includes('aluminum'));
 assert.ok(otherMetalKeys.includes('tin'));
 assert.ok(otherMetalKeys.includes('brass'));
 assert.ok(otherMetalKeys.includes('bronze'));
 assert.ok(otherMetalKeys.every(key=>Number.isFinite(materials[key].density)&&materials[key].density>0));
});

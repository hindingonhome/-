import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, estimate, estimateVolume, unitChoices, needsUnitCheck, suggestImportUnit, cloneCard } from '../src/core.mjs';
export const cube = new Float64Array([
0,0,0, 0,10,0, 10,10,0, 0,0,0, 10,10,0, 10,0,0,
0,0,10, 10,0,10, 10,10,10, 0,0,10, 10,10,10, 0,10,10,
0,0,0, 10,0,0, 10,0,10, 0,0,0, 10,0,10, 0,0,10,
0,10,0, 0,10,10, 10,10,10, 0,10,0, 10,10,10, 10,10,0,
0,0,0, 0,0,10, 0,10,10, 0,0,0, 0,10,10, 0,10,0,
10,0,0, 10,10,0, 10,10,10, 10,0,0, 10,10,10, 10,0,10]);
test('closed 10 mm cube volume and gold material cost',()=>{
const a=analyze(cube); assert.equal(a.valid,true); assert.equal(a.volume,1000); assert.deepEqual(a.dimensions,[10,10,10]);
assert.deepEqual(estimate(a.volume,1,[1,1,1],19.32,100),{volume:1,mass:19.32,cost:1932});
});
test('scale determinant, centimeters and custom density',()=>{
assert.equal(estimate(1000,1,[2,2,2],10,1).mass,80);
assert.equal(estimate(1,10,[1,1,1],8.96,1).mass,8.96);
assert.equal(estimate(1000,1,[2,3,4],1,1).volume,24);
});
test('inward winding and translated mesh preserve volume',()=>{
const rev=cube.slice(); for(let i=0;i<rev.length;i+=9) for(let k=0;k<3;k++) [rev[i+3+k],rev[i+6+k]]=[rev[i+6+k],rev[i+3+k]];
assert.equal(analyze(rev).volume,1000); assert.equal(analyze(rev).valid,true);
assert.equal(analyze(cube.map(x=>x+1e6)).volume,1000);
});
test('open and degenerate meshes cannot produce trusted estimates',()=>{
assert.equal(analyze(cube.slice(9)).valid,false);
assert.equal(analyze(new Float64Array(9)).valid,false);
assert.throws(()=>analyze(new Float64Array([NaN,0,0])));
});
test('invalid inputs never become zero or infinite costs',()=>{
for(const n of [0,-1,Infinity,NaN]) assert.throws(()=>estimate(1000,n,[1,1,1],19.32,100));
assert.throws(()=>estimate(1000,1,[1,0,1],19.32,100));
assert.throws(()=>estimate(1000,1,[1,1,1],-2,100));
assert.equal(estimate(1000,1,[1,1,1],19.32,null).cost,null);
});
test('unit selection suggestion is available for every imported format',()=>{
 assert.equal(suggestImportUnit('stl',[1,1,1]),'mm');
 assert.equal(suggestImportUnit('glb',[1,1,1]),'m');
 assert.equal(suggestImportUnit('obj',[10,10,10]),'mm');
 assert.equal(suggestImportUnit('ply',[.1,.1,.1]),'ft');
});
test('legacy anomaly helper remains informational and conversion offers five units',()=>{
assert.equal(needsUnitCheck('stl',[.02,.02,.02]),false);
assert.equal(needsUnitCheck('obj',[.02,.02,.02]),true);
assert.equal(needsUnitCheck('obj',[20,20,20]),false);
assert.deepEqual(unitChoices([.02,.01,.03]).map(x=>x.dimensions),[[.02,.01,.03],[.2,.1,.3],[20,10,30],[.508,.254,.762],[6.096,3.048,9.144]]);
});
test('copy edits do not mutate source scale',()=>{
const a={id:'a',name:'原始',scale:[1,1,1],original:true};const b=cloneCard(a); b.scale[0]=2;
assert.equal(a.scale[0],1);assert.notEqual(a.id,b.id);assert.equal(b.original,false);
});
test('manual cm3 volume calculates mass with no model or scale',()=>{
assert.deepEqual(estimateVolume(2.5,19.3,100),{volume:2.5,mass:48.25,cost:4825});
assert.equal(estimateVolume(2.5,10.49,null).cost,null);
for(const v of [0,-1,NaN,Infinity])assert.throws(()=>estimateVolume(v,19.3,100));
});

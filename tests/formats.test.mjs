import test from 'node:test';import assert from 'node:assert/strict';
import { BoxGeometry, Mesh, MeshBasicMaterial, Group } from 'three';
import { parseModel, exportModel, flatten } from '../src/formats.mjs';
import { analyze } from '../src/core.mjs';
const geom=new BoxGeometry(10,10,10).toNonIndexed();const p=new Float64Array(geom.attributes.position.array);
for(const ext of ['stl','obj','ply'])test(`${ext} export and reimport preserves doubled physical dimensions`,async()=>{
const data=exportModel(p,[2,2,2],ext);const buf=typeof data==='string'?new TextEncoder().encode(data).buffer:data;
const result=await parseModel(buf,ext);const a=analyze(result);assert.ok(Math.abs(a.volume-8000)<.01);assert.deepEqual(a.dimensions,[20,20,20]);assert.equal(a.valid,true);
});
test('world scale is baked when flattening a model',()=>{
const root=new Group(),mesh=new Mesh(geom,new MeshBasicMaterial());root.add(mesh);root.scale.set(2,3,4);root.position.set(100,10,0);
const a=analyze(flatten(root));assert.ok(Math.abs(a.volume-24000)<.001);assert.deepEqual(a.dimensions,[20,30,40]);
});
test('empty OBJ and unsupported types are rejected',async()=>{
await assert.rejects(parseModel(new TextEncoder().encode('garbage').buffer,'obj'));
await assert.rejects(parseModel(new ArrayBuffer(4),'step'));
});
for(const ext of ['stl','obj','ply'])test(`${ext} preserves tiny off-origin geometry at millimeter export scale`,async()=>{
const g=new BoxGeometry(.01,.01,.01).toNonIndexed(),mesh=new Mesh(g);mesh.position.set(1e6,1e6,1e6);const positions=flatten(mesh);
const data=exportModel(positions,[1000,1000,1000],ext),buffer=typeof data==='string'?new TextEncoder().encode(data).buffer:data;
const a=analyze(await parseModel(buffer,ext));assert.ok(a.valid);assert.ok(Math.abs(a.volume-1000)<.01);assert.ok(a.dimensions.every(v=>Math.abs(v-10)<.0001));
});
for(const ext of ['stl','obj','ply'])test(`${ext} exports selected coordinate units without changing physical dimensions`,async()=>{
const positions=new Float64Array(new BoxGeometry(10,10,10).toNonIndexed().attributes.position.array);
for(const [unit,factor,unitsPerMm] of [['cm',.1,10],['in',1/25.4,25.4],['ft',1/304.8,304.8]]){
 const data=exportModel(positions,[factor,factor,factor],ext,unit),buf=typeof data==='string'?new TextEncoder().encode(data).buffer:data;
 const parsed=await parseModel(buf,ext),result=analyze(parsed);assert.ok(Math.abs(result.dimensions[0]*unitsPerMm-10)<.0001,`${ext} ${unit} physical width`);
 if(ext==='obj'||ext==='ply')assert.match(data instanceof Uint8Array?new TextDecoder().decode(data):data,new RegExp(`units?[: ]+${unit}`,'i'));
}
});

import test from 'node:test';import assert from 'node:assert/strict';import {BoxGeometry} from 'three';
import {exportModel} from '../src/formats.mjs';
import {analyzeFile,convertFile} from '../src/stream.mjs';
const p=new BoxGeometry(10,10,10).toNonIndexed().attributes.position.array;
test('binary and ASCII STL streams retain full volume independent of preview budget',async()=>{
 const binary=new Blob([exportModel(p,[1,1,1],'stl')]);
 const r=await analyzeFile(binary,'stl',{previewLimit:2,topologyLimit:0});assert.equal(r.analysis.triangles,12);assert.ok(Math.abs(r.analysis.volume-1000)<1e-6);assert.equal(r.positions.length,18);assert.equal(r.analysis.topologyChecked,false);
 const ascii='solid t\n'+Array.from({length:12},(_,i)=>'facet normal 0 0 0\nouter loop\n'+[0,1,2].map(j=>'vertex '+Array.from(p.slice(i*9+j*3,i*9+j*3+3)).join(' ')).join('\n')+'\nendloop\nendfacet').join('\n')+'\nendsolid t';
 const s=await analyzeFile(new Blob([ascii]),'stl');assert.equal(s.analysis.valid,true);assert.equal(s.analysis.volume,1000);
});
test('OBJ negative indices and chunk-split text are read without whole-file loading',async()=>{
 const obj=exportModel(p,[1,1,1],'obj');const r=await analyzeFile(new Blob([obj]),'obj',{chunkBytes:37});assert.ok(r.analysis.valid);assert.equal(r.analysis.volume,1000);
 const n=await analyzeFile(new Blob(['v 0 0 0\nv 1 0 0\nv 0 1 0\nf -3 -2 -1\n']),'obj');assert.equal(n.analysis.triangles,1);assert.equal(n.analysis.valid,false);
});
test('stream conversion uses every source triangle, never preview triangles',async()=>{
 const source=new Blob([exportModel(p,[1,1,1],'stl')]),chunks=[];
 await convertFile(source,'stl','stl',{center:[0,0,0],factors:[2,2,2],triangles:12},b=>chunks.push(b));
 const result=await analyzeFile(new Blob(chunks),'stl');assert.ok(result.analysis.valid);assert.equal(result.analysis.volume,8000);assert.equal(result.analysis.triangles,12);
});
test('truncated STL and invalid OBJ references are rejected',async()=>{
 const b=exportModel(p,[1,1,1],'stl');await assert.rejects(analyzeFile(new Blob([b.slice(0,-10)]),'stl'));
 await assert.rejects(analyzeFile(new Blob(['v 0 0 0\nf 1 2 3']),'obj'));
});

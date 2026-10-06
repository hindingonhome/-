import test from 'node:test';
import assert from 'node:assert/strict';
import {BoxGeometry} from 'three';
import {exportModel} from '../src/formats.mjs';

test('analysis worker honors the requested surface budget above the topology threshold',async()=>{
 const cube=new BoxGeometry(10,10,10).toNonIndexed().attributes.position.array;
 const positions=new Float32Array(160008*9);
 for(let i=0;i<positions.length;i+=cube.length)positions.set(cube.subarray(0,Math.min(cube.length,positions.length-i)),i);
 const file=new Blob([exportModel(positions,[1,1,1],'stl')]);
 const messages=[];globalThis.self={postMessage:message=>messages.push(message)};
 try{
  await import('../src/compute-worker.mjs');
  await self.onmessage({data:{type:'analyze',file,ext:'stl',previewLimit:2}});
  const result=messages.find(m=>m.type==='result')?.result;
  assert.ok(result,JSON.stringify(messages.at(-1)));
  assert.equal(result.analysis.triangles,160008);
  assert.equal(result.positions.length,18);
  assert.ok(Math.abs(result.analysis.volume-1000*13334)<1e-6);
 }finally{delete globalThis.self;}
});

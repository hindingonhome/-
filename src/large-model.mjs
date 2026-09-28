import {runWorker} from './worker-client.mjs';
export async function fingerprint(file){const a=await file.slice(0,65536).arrayBuffer(),b=await file.slice(Math.max(0,file.size-65536)).arrayBuffer();const joined=new Uint8Array(a.byteLength+b.byteLength+8);joined.set(new Uint8Array(a));joined.set(new Uint8Array(b),a.byteLength);new DataView(joined.buffer).setFloat64(joined.length-8,file.size,true);const hash=await crypto.subtle.digest('SHA-256',joined);return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');}
export function validateSummary(a){
 if(!a||!Number.isSafeInteger(a.triangles)||a.triangles<=0||!Number.isFinite(a.volume)||a.volume<=0||typeof a.valid!=='boolean'||a.topologyChecked!==false)throw Error('高面数计算记录无效');
 for(const key of ['min','max','center','dimensions'])if(!Array.isArray(a[key])||a[key].length!==3||!a[key].every(Number.isFinite))throw Error('模型尺寸记录无效');
 if(a.dimensions.some(v=>v<0)||Math.max(...a.dimensions)<=0)throw Error('模型尺寸无效');return {...a};
}
export function samplePositions(p,limit=100000){const n=p.length/9;if(n<=limit)return p;const stride=Math.ceil(n/limit),sample=new Float64Array(Math.ceil(n/stride)*9);for(let i=0,j=0;i<n;i+=stride,j+=9)sample.set(p.subarray(i*9,i*9+9),j);return sample;}
export async function exportLarge({file,model,targetExt,factors,unit='mm',handle,progress,taskHook}){
 const chunks=[];let bytes=0,sink=null;
 try{
 if(handle)sink=await handle.createWritable();
 const job=runWorker({type:'export',file,ext:model.ext,targetExt,meta:{triangles:model.analysis.triangles,center:model.analysis.center,factors,unit}},progress,async chunk=>{if(sink)await sink.write(chunk);else{bytes+=chunk.byteLength;if(bytes>200*1024*1024)throw Error('输出超过 200 MB，请使用支持直接写入文件的 Chrome / Edge 导出');chunks.push(chunk);}});
 taskHook(job);await job.promise;if(sink){await sink.close();return null;}return new Blob(chunks,{type:'application/octet-stream'});
 }catch(e){if(sink)await sink.abort().catch(()=>{});throw e;}
}

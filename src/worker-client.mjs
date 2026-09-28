import workerCode from './worker-code.txt';
export function runWorker(payload,onProgress,onChunk){
 const url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'})),worker=new Worker(url),tempName='metal-lab-temp-'+crypto.randomUUID();let rejectTask;
 const cleanup=()=>{worker.terminate();URL.revokeObjectURL(url);if(navigator.storage?.getDirectory)navigator.storage.getDirectory().then(r=>r.removeEntry(tempName)).catch(()=>{});};
 const promise=new Promise((resolve,reject)=>{rejectTask=reject;worker.onmessage=async({data:d})=>{if(d.type==='progress')onProgress?.(d.fraction,d.label);if(d.type==='chunk'){try{await onChunk(new Uint8Array(d.buffer));worker.postMessage({type:'ack'});}catch(e){cleanup();reject(e);}}if(d.type==='result'){cleanup();resolve(d.result);}if(d.type==='error'){cleanup();reject(Error(d.message));}};worker.onerror=e=>{cleanup();reject(Error(e.message||'后台计算失败'));};worker.postMessage({...payload,tempName});});
 return {promise,cancel(){cleanup();rejectTask(Error('已取消，原有记录未改变'));}};
}

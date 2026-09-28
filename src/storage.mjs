const KEY='metal-lab-v2';
async function open(key=KEY){return new Promise((resolve,reject)=>{const request=indexedDB.open(key,1);request.onupgradeneeded=()=>request.result.createObjectStore('workspace');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function read(key){const db=await open(key);return new Promise((resolve,reject)=>{const tx=db.transaction('workspace'),req=tx.objectStore('workspace').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
export async function readWorkspace(){return (await read(KEY))??(await read('metal-lab-v1'));}
export async function writeWorkspace(state){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(state,'current');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}

import {analyze} from './core.mjs';
const CHUNK=4*1024*1024;
export async function* textLines(file,chunkBytes=CHUNK){
 const decoder=new TextDecoder();let rest='';
 for(let off=0;off<file.size;off+=chunkBytes){const end=Math.min(file.size,off+chunkBytes);rest+=decoder.decode(await file.slice(off,end).arrayBuffer(),{stream:end<file.size});let start=0,index;
 while((index=rest.indexOf('\n',start))!==-1){yield rest.slice(start,index).replace(/\r$/,'');start=index+1;}rest=rest.slice(start);
 if(rest.length>8*1024*1024)throw Error('单行超过 8 MB，无法安全解析');
 }if(rest.trim())yield rest;
}
class Vertices {
 constructor(){this.pageSize=65536;this.pages=[];this.count=0;this.cache=new Map();}
 async open(tempName){if(!tempName)return;try{this.root=await navigator.storage.getDirectory();this.name=tempName;const f=await this.root.getFileHandle(tempName,{create:true});this.disk=await f.createSyncAccessHandle();this.disk.truncate(0);}catch{this.disk=null;}}
 add(x,y,z){if(![x,y,z].every(Number.isFinite))throw Error('OBJ 顶点含无效坐标');const page=Math.floor(this.count/this.pageSize),idx=this.count%this.pageSize;
 if(idx===0){if(this.disk&&this.buffer)this.disk.write(this.buffer,{at:(page-1)*this.pageSize*24});if(!this.disk&&page*this.pageSize*24>=256*1024*1024)throw Error('当前浏览器无法使用临时磁盘，OBJ 顶点超过内存预算。请用桌面 Chrome/Edge，或导出二进制 STL 再计算');this.buffer=new Float64Array(this.pageSize*3);if(!this.disk)this.pages.push(this.buffer);}
 this.buffer.set([x,y,z],idx*3);this.count++;
 }
 seal(){if(this.disk&&this.buffer)this.disk.write(this.buffer.subarray(0,(this.count%this.pageSize||this.pageSize)*3),{at:Math.floor((this.count-1)/this.pageSize)*this.pageSize*24});this.buffer=null;}
 get(index,out,offset){if(index<0||index>=this.count||!Number.isInteger(index))throw Error('OBJ 的面引用了不存在的顶点');const page=Math.floor(index/this.pageSize),idx=index%this.pageSize;let b=this.disk?this.cache.get(page):this.pages[page];
 if(!b&&this.disk){b=new Float64Array(this.pageSize*3);this.disk.read(b,{at:page*this.pageSize*24});if(this.cache.size>=8)this.cache.delete(this.cache.keys().next().value);this.cache.set(page,b);}out[offset]=b[idx*3];out[offset+1]=b[idx*3+1];out[offset+2]=b[idx*3+2];
 }
 async close(){this.disk?.close();if(this.root&&this.name)await this.root.removeEntry(this.name).catch(()=>{});}
}
export async function readTriangles(file,ext,onTriangle,options={}){
 const progress=options.progress||(()=>{}),flush=options.flush||(()=>{});let count=0;const t=new Float64Array(9);
 if(ext==='stl'){
 const header=await file.slice(0,84).arrayBuffer();if(header.byteLength<15)throw Error('STL 文件不完整');let binary=false,n=0;
 if(header.byteLength>=84){n=new DataView(header).getUint32(80,true);binary=file.size===84+n*50;}
 if(binary){const facesPerChunk=65536;
 for(let start=0;start<n;start+=facesPerChunk){const size=Math.min(facesPerChunk,n-start),b=await file.slice(84+start*50,84+(start+size)*50).arrayBuffer(),v=new DataView(b);if(b.byteLength!==size*50)throw Error('STL 数据不完整');
 for(let i=0;i<size;i++){for(let k=0;k<9;k++)t[k]=v.getFloat32(i*50+12+k*4,true);onTriangle(t,count++,n);}await flush();progress((start+size)/n,`读取 ${count.toLocaleString()} 个三角面`);
 }return count;
 }
 const prefix=new TextDecoder().decode(header);if(!/^\s*solid\b/i.test(prefix))throw Error('二进制 STL 长度与面数不符，文件可能被截断');
 let vertices=0,lines=0,facets=0,inFacet=false;
 for await(const raw of textLines(file,options.chunkBytes)){const line=raw.trim();lines++;
 if(/^facet\s/i.test(line)){if(inFacet)throw Error('STL 面定义不完整');inFacet=true;vertices=0;facets++;}
 if(/^vertex\s/i.test(line)){if(!inFacet||vertices>=3)throw Error('STL 三角面顶点数量异常');const parts=line.split(/\s+/);if(parts.length!==4)throw Error('STL 顶点格式错误');for(let k=0;k<3;k++)t[vertices*3+k]=Number(parts[k+1]);vertices++;}
 if(/^endfacet\b/i.test(line)){if(!inFacet||vertices!==3)throw Error('STL 三角面不完整');onTriangle(t,count++);inFacet=false;}
 if(lines%30000===0){await flush();progress(null,`已读取 ${count.toLocaleString()} 面 · ASCII STL`);}
 }if(inFacet||!count||facets!==count)throw Error('STL 文件没有完整三角网格');await flush();progress(1,'读取完成');return count;
 }
 if(ext==='obj'){
 const store=new Vertices();await store.open(options.tempName);let lines=0;
 try{
 for await(const raw of textLines(file,options.chunkBytes)){const line=raw.trim();if(/^v\s/.test(line)){const p=line.split(/\s+/);if(p.length<4)throw Error('OBJ 顶点数据不足');store.add(Number(p[1]),Number(p[2]),Number(p[3]));}if(++lines%50000===0)progress(null,`第一遍：索引 ${store.count.toLocaleString()} 个顶点`);}store.seal();if(!store.count)throw Error('OBJ 没有顶点');
 let seenVertices=0;lines=0;
 for await(const raw of textLines(file,options.chunkBytes)){const line=raw.trim().split('#')[0].trim();if(/^v\s/.test(line))seenVertices++;
 if(/^f\s/.test(line)){const tokens=line.slice(1).trim().split(/\s+/);if(tokens.length<3)throw Error('OBJ 面至少需要 3 个顶点');const ids=tokens.map(s=>{const v=s.split('/')[0];if(!/^[+-]?\d+$/.test(v)||Number(v)===0)throw Error('OBJ 顶点索引无效');const n=Number(v);return n>0?n-1:seenVertices+n;});
 store.get(ids[0],t,0);for(let i=1;i<ids.length-1;i++){store.get(ids[i],t,3);store.get(ids[i+1],t,6);onTriangle(t,count++);}
 }if(++lines%25000===0){await flush();progress(null,`第二遍：计算 ${count.toLocaleString()} 个三角面`);}
 }if(!count)throw Error('OBJ 没有面');await flush();progress(1,'读取完成');return count;
 }finally{await store.close();}
 }
 throw Error('分块读取仅支持 STL / OBJ');
}
export async function analyzeFile(file,ext,options={}){
 const completeLimit=options.previewLimit??2000000,sampleLimit=Math.min(options.sampleLimit??100000,completeLimit),topologyLimit=options.topologyLimit??150000;
 let preview=new Float64Array(0),previewUsed=0,sampling=false,full=[],fullCount=0,count=0,sum=0,compensation=0,degenerate=0,reference=null,seed=123456789;
 function ensurePreview(required,total){if(preview.length/9>=required)return;const capacity=total&&total<=completeLimit?total:Math.min(completeLimit,Math.max(required,Math.max(4096,preview.length/9*2)));const next=new Float64Array(capacity*9);next.set(preview);preview=next;}
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 await readTriangles(file,ext,(p,index,total)=>{
 for(let i=0;i<9;i++){const v=p[i];if(!Number.isFinite(v))throw Error('模型含无效坐标');const k=i%3;if(v<min[k])min[k]=v;if(v>max[k])max[k]=v;}
 if(!reference)reference=[p[0],p[1],p[2]];
 const ax=p[0]-reference[0],ay=p[1]-reference[1],az=p[2]-reference[2],bx=p[3]-reference[0],by=p[4]-reference[1],bz=p[5]-reference[2],cx=p[6]-reference[0],cy=p[7]-reference[1],cz=p[8]-reference[2];
 const term=ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx),y=term-compensation,next=sum+y;compensation=(next-sum)-y;sum=next;
 const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;if((uy*vz-uz*vy)**2+(uz*vx-ux*vz)**2+(ux*vy-uy*vx)**2===0)degenerate++;
 if(index<topologyLimit){if(index%4096===0)full.push(new Float64Array(Math.min(4096,topologyLimit-index)*9));full.at(-1).set(p,(index%4096)*9);fullCount++;}else if(full.length){full=[];fullCount=0;}
 if(total>completeLimit){if(!sampling){preview=new Float64Array(sampleLimit*9);sampling=true;}const stride=Math.ceil(total/sampleLimit),slot=index%stride===0?Math.floor(index/stride):-1;if(slot>=0&&slot<sampleLimit){preview.set(p,slot*9);previewUsed=Math.max(previewUsed,slot+1);}}
 else if(index<completeLimit){ensurePreview(index+1,total);preview.set(p,index*9);previewUsed=index+1;}
 else{if(!sampling){const reduced=new Float64Array(sampleLimit*9),stride=Math.ceil(completeLimit/sampleLimit);for(let j=0;j<sampleLimit;j++)reduced.set(preview.subarray(j*stride*9,j*stride*9+9),j*9);preview=reduced;previewUsed=sampleLimit;sampling=true;}seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const slot=Math.floor((seed>>>0)/4294967296*(index+1));if(slot<sampleLimit)preview.set(p,slot*9);}
 count++;
 },options);
 if(!count)throw Error('模型没有三角面');
 if(count<=topologyLimit){const positions=new Float64Array(count*9);let o=0;for(const chunk of full){const n=Math.min(chunk.length,positions.length-o);positions.set(chunk.subarray(0,n),o);o+=n;}return {positions,analysis:{...analyze(positions),topologyChecked:true},previewOnly:false};}
 const volume=Math.abs(sum)/6;if(!Number.isFinite(volume)||volume<=0)throw Error('无法得到有效体积：模型可能未封闭、面方向抵消或全部退化');
 return {positions:preview.length===previewUsed*9?preview:preview.slice(0,previewUsed*9),previewOnly:true,analysis:{volume,dimensions:min.map((v,i)=>max[i]-v),min,max,center:min.map((v,i)=>v+(max[i]-v)/2),triangles:count,valid:true,topologyChecked:false,boundary:null,nonManifold:null,inconsistent:null,degenerate}};
}
export async function convertFile(file,sourceExt,targetExt,meta,write,options={}){
 const {triangles,center,factors}=meta,encoder=new TextEncoder();let index=0,parts=[],bytes=0,binary=new Uint8Array(50*65536),dv=new DataView(binary.buffer),binaryCount=0,ready=[];
 if(targetExt==='stl'){if(triangles>0xffffffff)throw Error('STL 格式最多记录 2³²−1 个三角面');const header=new Uint8Array(84);header.set(encoder.encode('Metal Lab | millimeters | centered'));new DataView(header.buffer).setUint32(80,triangles,true);await write(header);}
 else if(targetExt==='obj')await write(encoder.encode('# Metal Lab | millimeters | centered\n'));
 else if(targetExt==='ply')await write(encoder.encode(`ply\nformat ascii 1.0\ncomment units millimeters; centered\nelement vertex ${triangles*3}\nproperty double x\nproperty double y\nproperty double z\nelement face ${triangles}\nproperty list uchar int vertex_indices\nend_header\n`));
 else throw Error('导出格式无效');
 async function flush(){for(const b of ready)await write(b);ready=[];if(binaryCount){await write(binary.slice(0,binaryCount*50));binaryCount=0;}if(parts.length){await write(encoder.encode(parts.join('')));parts=[];bytes=0;}}
 await readTriangles(file,sourceExt,p=>{
 const a=new Float64Array(9);for(let k=0;k<9;k++)a[k]=(p[k]-center[k%3])*factors[k%3];
 if(targetExt==='stl'){if(binaryCount>=65536){ready.push(binary);binary=new Uint8Array(50*65536);dv=new DataView(binary.buffer);binaryCount=0;}const o=binaryCount++*50;const ux=a[3]-a[0],uy=a[4]-a[1],uz=a[5]-a[2],vx=a[6]-a[0],vy=a[7]-a[1],vz=a[8]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.hypot(nx,ny,nz)||1;dv.setFloat32(o,nx/len,true);dv.setFloat32(o+4,ny/len,true);dv.setFloat32(o+8,nz/len,true);for(let k=0;k<9;k++)dv.setFloat32(o+12+k*4,a[k],true);dv.setUint16(o+48,0,true);}
 else{let s='';for(let k=0;k<9;k+=3)s+=`${targetExt==='obj'?'v ':''}${a[k]} ${a[k+1]} ${a[k+2]}\n`;if(targetExt==='obj')s+=`f ${index*3+1} ${index*3+2} ${index*3+3}\n`;parts.push(s);bytes+=s.length;}index++;
 },{...options,flush});await flush();if(index!==triangles)throw Error('原文件三角面数量与计算记录不一致');
 if(targetExt==='ply'){for(let i=0;i<triangles;i++){parts.push(`3 ${i*3} ${i*3+1} ${i*3+2}\n`);if(parts.length>=30000)await flush();}await flush();}
}

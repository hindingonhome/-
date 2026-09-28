const utf8=new TextEncoder();
const table=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function zipFiles(files){
 if(!Array.isArray(files)||!files.length||files.length>100)throw Error('图片数量无效');
 const chunks=[],central=[];let offset=0;
 for(const {name,data} of files){if(typeof name!=='string'||!name||!(data instanceof Uint8Array))throw Error('图片文件无效');const filename=utf8.encode(name),size=data.length,crc=crc32(data);if(filename.length>65535||size>0xffffffff)throw Error('图片文件过大');
 const local=new Uint8Array(30+filename.length),l=new DataView(local.buffer);l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x800,true);l.setUint32(14,crc,true);l.setUint32(18,size,true);l.setUint32(22,size,true);l.setUint16(26,filename.length,true);local.set(filename,30);chunks.push(local,data);
 const header=new Uint8Array(46+filename.length),h=new DataView(header.buffer);h.setUint32(0,0x02014b50,true);h.setUint16(4,20,true);h.setUint16(6,20,true);h.setUint16(8,0x800,true);h.setUint32(16,crc,true);h.setUint32(20,size,true);h.setUint32(24,size,true);h.setUint16(28,filename.length,true);h.setUint32(42,offset,true);header.set(filename,46);central.push(header);offset+=local.length+size;
 }
 const centralSize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
 const output=new Uint8Array(offset+centralSize+end.length);let at=0;for(const part of [...chunks,...central,end]){output.set(part,at);at+=part.length;}return output;
}

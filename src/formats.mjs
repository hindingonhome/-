import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, LoadingManager, Vector3, Matrix4 } from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

export function flatten(root){
 root.updateMatrixWorld(true);const chunks=[];let count=0;
 root.traverse(o=>{if(!o.isMesh)return;if(o.isSkinnedMesh||o.morphTargetInfluences?.length)throw Error('此版本仅支持静态网格，不支持骨骼或形态变形');
 const g=o.geometry,p=g.getAttribute('position'),idx=g.getIndex();if(!p)return;
 const n=idx?idx.count:p.count;count+=n;if(count>9000000)throw Error('该格式的常规读取上限为 300 万面；高面数请使用 STL / OBJ 分块导入');
 const instances=o.isInstancedMesh?o.count:1; if(count*instances>9000000)throw Error('实例数量过多');
 for(let instance=0;instance<instances;instance++){
 const mat=o.matrixWorld.clone();if(o.isInstancedMesh){const im=new Matrix4();o.getMatrixAt(instance,im);mat.multiply(im);}
 const a=new Float64Array(n*3),v=new Vector3();for(let i=0;i<n;i++){v.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(mat);a.set([v.x,v.y,v.z],i*3);}
 if(mat.determinant()<0)for(let i=0;i<a.length;i+=9)for(let k=0;k<3;k++)[a[i+3+k],a[i+6+k]]=[a[i+6+k],a[i+3+k]];
 chunks.push(a);
 }});
 const length=chunks.reduce((n,a)=>n+a.length,0);if(!length)throw Error('未发现可用三角网格（不支持纯点云或线条）');if(length>27000000)throw Error('该格式的常规读取上限为 300 万面；高面数请使用 STL / OBJ 分块导入');
 const result=new Float64Array(length);let offset=0;for(const a of chunks){result.set(a,offset);offset+=a.length;}return result;
}
function fromGeometry(g){if(!g.getAttribute('position')?.count)throw Error('文件没有网格');return flatten(new Mesh(g));}
function base64(buf){let s='';const a=new Uint8Array(buf);for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);}
async function parseGLTF(buf,ext,resources){
 let json,bin;
 if(ext==='glb'){
 const dv=new DataView(buf);if(buf.byteLength<20||dv.getUint32(0,true)!==0x46546c67||dv.getUint32(4,true)!==2)throw Error('不是有效 GLB 2.0 文件');
 for(let off=12;off+8<=buf.byteLength;){const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true);if(off+8+len>buf.byteLength)throw Error('GLB 数据不完整');const part=buf.slice(off+8,off+8+len);if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(part).trim());if(type===0x004e4942)bin=part;off+=8+len;}
 }else json=JSON.parse(new TextDecoder().decode(buf));
 if(!json?.asset||json.asset.version!=='2.0')throw Error('只支持 glTF 2.0');
 if(json.extensionsRequired?.some(x=>/draco|meshopt/i.test(x)))throw Error('暂不支持 Draco / Meshopt 压缩，请导出未压缩 GLB');
 if(json.skins?.length||json.meshes?.some(m=>m.primitives.some(p=>p.targets)))throw Error('仅支持静态 GLB/GLTF，请先导出静态网格');
 for(const b of json.buffers||[]){if(!b.uri&&bin)b.uri='data:application/octet-stream;base64,'+base64(bin);else if(b.uri&&!b.uri.startsWith('data:')){const name=decodeURIComponent(b.uri).split('/').pop();const data=resources[name];if(!data)throw Error(`缺少配套文件 ${name}，请与 GLTF 一起选择导入`);b.uri='data:application/octet-stream;base64,'+base64(data);}}
 // Material and animation data are intentionally omitted: geometry conversion only.
 delete json.images;delete json.textures;delete json.samplers;delete json.materials;delete json.animations;
 for(const m of json.meshes||[])for(const p of m.primitives)delete p.material;
 const manager=new LoadingManager();manager.setURLModifier(url=>{if(!url.startsWith('data:')&&!url.startsWith('blob:'))throw Error('外部网络资源已禁用');return url;});
 const gltf=await new GLTFLoader(manager).parseAsync(JSON.stringify(json),'');return flatten(gltf.scene);
}
export async function parseModel(buf,ext,resources={}){
 if(buf.byteLength>256*1024*1024)throw Error('PLY / GLB / GLTF 常规读取上限 256 MB，请将大模型导出 STL / OBJ');
 const text=()=>new TextDecoder().decode(buf);
 if(ext==='stl'){if(buf.byteLength<15)throw Error('STL 文件过短');return fromGeometry(new STLLoader().parse(buf));}
 if(ext==='obj')return flatten(new OBJLoader().parse(text()));
 if(ext==='ply'){const g=new PLYLoader().parse(buf);if(!g.index)throw Error('PLY 必须包含面，暂不支持点云');return fromGeometry(g);}
 if(ext==='glb'||ext==='gltf')return parseGLTF(buf,ext,resources);
 throw Error('不支持此格式。可导入 STL、OBJ、PLY、GLB、GLTF');
}
export function exportModel(positions,factors,ext,unit='mm'){
 // STL and many downstream mesh readers use float32. Center in float64 BEFORE
 // scaling so distant scene origins cannot erase the object's small dimensions.
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<positions.length;i++){const k=i%3;min[k]=Math.min(min[k],positions[i]);max[k]=Math.max(max[k],positions[i]);}
 const center=min.map((v,k)=>(v+max[k])/2);
 const p=new Float64Array(positions.length);for(let i=0;i<p.length;i++)p[i]=(positions[i]-center[i%3])*factors[i%3];
 if(ext==='ply'){
 const lines=['ply','format ascii 1.0',`comment Metal Lab units ${unit}`,`element vertex ${p.length/3}`,'property double x','property double y','property double z',`element face ${p.length/9}`,'property list uchar int vertex_indices','end_header'];
 for(let i=0;i<p.length;i+=3)lines.push(`${p[i]} ${p[i+1]} ${p[i+2]}`);for(let i=0;i<p.length/3;i+=3)lines.push(`3 ${i} ${i+1} ${i+2}`);return lines.join('\n');
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.computeVertexNormals();const m=new Mesh(g,new MeshBasicMaterial());m.updateMatrixWorld();
 let result;if(ext==='stl'){const v=new STLExporter().parse(m,{binary:true});result=v.buffer;}else if(ext==='obj')result=`# Units: ${unit}\n`+new OBJExporter().parse(m);else throw Error('不支持该导出格式');g.dispose();m.material.dispose();return result;
}

export const UNITS = {mm:1,cm:10,m:1000,in:25.4,ft:304.8};
export const DISPLAY_UNITS = {mm:1,cm:10,in:25.4,ft:304.8};
export function positive(n,name='数值'){if(!Number.isFinite(n)||n<=0)throw Error(`${name}必须是大于 0 的有限数字`);return n;}
export function analyze(p){
 if(!p.length||p.length%9)throw Error('模型没有完整的三角面');
 const topologyChecked=p.length/9<=150000;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<p.length;i++){if(!Number.isFinite(p[i]))throw Error('模型含有无效坐标');const k=i%3;min[k]=Math.min(min[k],p[i]);max[k]=Math.max(max[k],p[i]);}
 const dimensions=min.map((v,k)=>max[k]-v), center=min.map((v,k)=>(v+max[k])/2);
 const extent=Math.max(...dimensions), tolerance=Math.max(extent*1e-8,1e-12);
 const vertices=new Map(),edges=new Map();let volume=0,degenerate=0;
 function vertex(i){const key=[0,1,2].map(k=>Math.round((p[i+k]-min[k])/tolerance)).join(',');if(!vertices.has(key))vertices.set(key,vertices.size);return vertices.get(key);}
 for(let i=0;i<p.length;i+=9){
  const a=[p[i]-center[0],p[i+1]-center[1],p[i+2]-center[2]],b=[p[i+3]-center[0],p[i+4]-center[1],p[i+5]-center[2]],c=[p[i+6]-center[0],p[i+7]-center[1],p[i+8]-center[2]];
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]));
  const ids=topologyChecked?[vertex(i),vertex(i+3),vertex(i+6)]:null;
  const u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]);
  const area=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]);
  if((ids&&new Set(ids).size<3)||area<tolerance*tolerance)degenerate++;
  if(ids)for(let k=0;k<3;k++){const x=ids[k],y=ids[(k+1)%3],key=x<y?`${x},${y}`:`${y},${x}`;const e=edges.get(key)||[0,0];e[0]++;e[1]+=x<y?1:-1;edges.set(key,e);}
 }
 let boundary=0,nonManifold=0,inconsistent=0;
 for(const [count,dir] of edges.values()){if(count===1)boundary++;else if(count!==2)nonManifold++;else if(dir!==0)inconsistent++;}
 volume=Math.abs(volume)/6;const valid=boundary===0&&nonManifold===0&&inconsistent===0&&degenerate===0&&volume>tolerance**3;
 return {volume,dimensions,min,max,center,triangles:p.length/9,boundary,nonManifold,inconsistent,degenerate,valid,topologyChecked};
}
export function estimate(rawVolume,unit,scale,density,price){
 positive(rawVolume,'体积');positive(unit,'单位');positive(density,'密度');
 if(!Array.isArray(scale)||scale.length!==3)throw Error('缩放参数无效');scale.forEach(n=>positive(n,'缩放'));
 if(price!==null&&(!Number.isFinite(price)||price<0))throw Error('单价不能为负数或无效值');
 const volume=rawVolume*unit**3*scale[0]*scale[1]*scale[2]/1000,mass=volume*density,cost=price===null?null:mass*price;
 if(!Number.isFinite(mass)||(cost!==null&&!Number.isFinite(cost)))throw Error('计算数值超出范围');return {volume,mass,cost};
}
export function unitChoices(dimensions){return Object.entries(UNITS).map(([unit,factor])=>({unit,factor,dimensions:dimensions.map(n=>Number((n*factor).toPrecision(12)))}));}
export function suggestImportUnit(ext,dimensions){if(ext==='stl')return'mm';if(ext==='glb'||ext==='gltf')return'm';const choices=unitChoices(dimensions);return choices.reduce((best,next)=>Math.abs(Math.log10(Math.max(...best.dimensions)/30))<Math.abs(Math.log10(Math.max(...next.dimensions)/30))?best:next).unit;}
export function estimateVolume(volumeCm3,density,price){positive(volumeCm3,'体积');return estimate(volumeCm3*1000,1,[1,1,1],density,price);}
export function needsUnitCheck(ext,dimensions){if(['stl','glb','gltf'].includes(ext))return false;const m=Math.max(...dimensions);return m<1||m>500;}
export function cloneCard(card){return {...card,id:crypto.randomUUID(),name:card.name+' · 副本',scale:[...card.scale],original:false};}

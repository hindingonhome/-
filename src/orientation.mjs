import {Vector3,Quaternion} from 'three';
export function setupOrientation(canvas,getCamera,controls,onView){
 const ctx=canvas.getContext('2d'),size=150,c=75,r=43;let endpoints=[],down=null,moved=false;
 const axes=[{name:'X',vector:[1,0,0],color:'#e58682',view:'right'},{name:'Y',vector:[0,1,0],color:'#9ebf77',view:'top'},{name:'Z',vector:[0,0,1],color:'#79ade1',view:'front'},{name:'−X',vector:[-1,0,0],color:'#e58682',view:'left'},{name:'−Y',vector:[0,-1,0],color:'#9ebf77',view:'bottom'},{name:'−Z',vector:[0,0,-1],color:'#79ade1',view:'back'}];
 function draw(){const q=getCamera().quaternion.clone().invert();ctx.clearRect(0,0,size,size);ctx.beginPath();ctx.arc(c,c,65,0,Math.PI*2);ctx.fillStyle='#25272b80';ctx.fill();
 endpoints=axes.map(a=>{const v=new Vector3(...a.vector).applyQuaternion(q);return {...a,x:c+v.x*r,y:c-v.y*r,z:v.z};}).sort((a,b)=>a.z-b.z);
 for(const a of endpoints){const front=a.z>-.05;ctx.globalAlpha=front?1:.55;ctx.strokeStyle=a.color;ctx.lineWidth=2;if(a.name.length===1){ctx.beginPath();ctx.moveTo(c,c);ctx.lineTo(a.x,a.y);ctx.stroke();}ctx.beginPath();ctx.arc(a.x,a.y,12,0,Math.PI*2);ctx.fillStyle=a.name.length===1?a.color:'#303338';ctx.fill();ctx.stroke();ctx.fillStyle=a.name.length===1?'#202327':a.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 12px sans-serif';ctx.fillText(a.name,a.x,a.y);}ctx.globalAlpha=1;
 }
 function point(e){const rect=canvas.getBoundingClientRect();return {x:(e.clientX-rect.left)*size/rect.width,y:(e.clientY-rect.top)*size/rect.height};}
 canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};moved=false;e.preventDefault();};
 canvas.onpointermove=e=>{if(!down)return;const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>4)moved=true;if(moved){const camera=getCamera(),eye=camera.position.clone().sub(controls.target),right=new Vector3(1,0,0).applyQuaternion(camera.quaternion),vertical=new Quaternion().setFromAxisAngle(right,-dy*.008),horizontal=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),-dx*.008);eye.applyQuaternion(vertical).applyQuaternion(horizontal);camera.up.applyQuaternion(vertical).applyQuaternion(horizontal);camera.position.copy(controls.target).add(eye);camera.lookAt(controls.target);controls.update();document.getElementById('viewSelect').value='iso';}down.lastX=e.clientX;down.lastY=e.clientY;};
 canvas.onpointerup=e=>{if(!down)return;if(!moved){const p=point(e),hit=endpoints.slice().reverse().find(a=>Math.hypot(a.x-p.x,a.y-p.y)<16);if(hit){onView(hit.view);document.getElementById('viewSelect').value=hit.view;}}down=null;};canvas.onpointercancel=()=>{down=null;};
 return {draw};
}

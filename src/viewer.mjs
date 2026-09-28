import * as THREE from 'three';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {samplePositions} from './large-model.mjs';
import {setupOrientation} from './orientation.mjs';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {nearestAxisFromDirection} from './view-axis.mjs';
export function createViewer(host){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x303236);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();let camera=new THREE.PerspectiveCamera(36,1,.01,10000),orthographic=false;camera.position.set(31,22,36);
 const controls=new TrackballControls(camera,renderer.domElement);controls.rotateSpeed=1.05;controls.dynamicDampingFactor=.15;
 controls.mouseButtons.LEFT=-1;controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=-1;
 let middleDragging=false,altSnapped=false,dragMode='rotate',lastPointer={x:0,y:0};
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==1)return;e.preventDefault();middleDragging=true;altSnapped=false;lastPointer={x:e.pageX,y:e.pageY};dragMode=e.shiftKey?'pan':e.ctrlKey?'zoom':'rotate';controls.mouseButtons.MIDDLE=dragMode==='pan'?THREE.MOUSE.PAN:dragMode==='zoom'?THREE.MOUSE.DOLLY:THREE.MOUSE.ROTATE;if(e.altKey)snapWhileDragging();},true);
 renderer.domElement.addEventListener('pointermove',e=>{if(!middleDragging)return;lastPointer={x:e.pageX,y:e.pageY};if(e.altKey)snapWhileDragging();},true);
 // Browsers may treat an uncancelled middle click as document autoscroll.
 renderer.domElement.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();},true);
 renderer.domElement.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();},true);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe8efff,0x404044,2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(5,10,7);scene.add(sun);
 let grid=new THREE.GridHelper(80,40,0x656972,0x41454c);grid.position.y=-4;grid.visible=false;scene.add(grid);
 const material=new THREE.MeshStandardMaterial({color:0xd3a15b,metalness:1,roughness:.27,side:THREE.DoubleSide});let mesh=null,span=25,currentScale=[1,1,1],baseSize=[20,20,20];
 function nearestAxis(){return nearestAxisFromDirection(camera.position.clone().sub(controls.target).normalize());}
 function fit(mode='iso'){
 const dirs={front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0],top:[0,1,.001],bottom:[0,-1,.001],iso:[1,.65,1.3]};const direction=new THREE.Vector3(...(dirs[mode]||dirs.iso)).normalize();
 const radius=Math.hypot(...baseSize.map((v,i)=>v*currentScale[i]))/2,distance=radius/Math.tan(THREE.MathUtils.degToRad(36/2))/Math.min(1,camera.aspect)*1.22;
 camera.position.copy(direction.multiplyScalar(distance));camera.up.set(0,1,0);if(orthographic){const h=radius*1.22/Math.min(1,camera.aspect);camera.left=-h*camera.aspect;camera.right=h*camera.aspect;camera.top=h;camera.bottom=-h;camera.zoom=1;}camera.near=Math.max(span/10000,.000001);camera.far=Math.max(span*100,100);camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.maxDistance=span*40;controls.minDistance=span*.03;controls.update();
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight,oldAspect=camera.aspect;renderer.setSize(w,h);camera.aspect=w/h;const factor=Math.min(1,oldAspect)/Math.min(1,camera.aspect);if(orthographic){camera.top*=factor;camera.bottom=-camera.top;camera.left=-camera.top*camera.aspect;camera.right=camera.top*camera.aspect;}else camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);camera.updateProjectionMatrix();controls.handleResize();}
 new ResizeObserver(resize).observe(host);resize();controls.handleResize();
 let lastModel=null;const orientation=setupOrientation(document.getElementById("axisCanvas"),()=>camera,controls,mode=>api.setAxisView(mode));
 const api={renderer,scene,
 makeThumbnail(model,color){
  if(model.manual||!model.positions.length)return null;
  const size=72,source=samplePositions(model.positions,35000),center=model.analysis.center;
  const values=new Float32Array(source.length);for(let i=0;i<values.length;i++)values[i]=source[i]-center[i%3];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(values,3));
  const continuous=source.length===model.positions.length&&source.length/9<=50000;
  if(continuous)geometry.computeVertexNormals();
  const thumbnailScene=new THREE.Scene();thumbnailScene.background=null;thumbnailScene.environment=env.texture;
  thumbnailScene.add(new THREE.HemisphereLight(0xffffff,0x494949,2));
  const lamp=new THREE.DirectionalLight(0xffffff,2.6);lamp.position.set(4,8,6);thumbnailScene.add(lamp);
  const thumbnailMaterial=continuous?new THREE.MeshStandardMaterial({color,metalness:.75,roughness:.31,side:THREE.DoubleSide}):new THREE.PointsMaterial({color,size:1.8,sizeAttenuation:false});
  thumbnailScene.add(continuous?new THREE.Mesh(geometry,thumbnailMaterial):new THREE.Points(geometry,thumbnailMaterial));
  const radius=Math.max(.001,Math.hypot(...model.analysis.dimensions)/2),cameraThumb=new THREE.PerspectiveCamera(34,1,.001,Math.max(100,radius*100));
  cameraThumb.position.set(1,.8,1.2).normalize().multiplyScalar(radius/Math.tan(THREE.MathUtils.degToRad(17))*1.35);cameraThumb.lookAt(0,0,0);
  const target=new THREE.WebGLRenderTarget(size,size,{depthBuffer:true,stencilBuffer:false});
  const previous=renderer.getRenderTarget(),viewport=new THREE.Vector4(),clearColor=new THREE.Color();renderer.getViewport(viewport);renderer.getClearColor(clearColor);const clearAlpha=renderer.getClearAlpha();
  try{
   renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.clear(true,true,true);renderer.render(thumbnailScene,cameraThumb);
   const pixels=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const context=canvas.getContext('2d'),image=context.createImageData(size,size);
   for(let y=0;y<size;y++)image.data.set(pixels.subarray((size-y-1)*size*4,(size-y)*size*4),y*size*4);
   context.putImageData(image,0,0);return canvas.toDataURL('image/webp',.68);
  }finally{renderer.setRenderTarget(previous);renderer.setViewport(viewport);renderer.setClearColor(clearColor,clearAlpha);target.dispose();geometry.dispose();thumbnailMaterial.dispose();}
 },
 setModel(model,factors,color){
  if(lastModel!==model.id){if(mesh){scene.remove(mesh);mesh.geometry.dispose();if(mesh.isPoints)mesh.material.dispose();}const completeSurface=model.positions.length/9===model.analysis.triangles,positions=completeSurface?model.positions:samplePositions(model.positions),center=model.analysis.center,a=new Float32Array(positions.length);for(let i=0;i<a.length;i++)a[i]=positions[i]-center[i%3];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));g.computeVertexNormals();
  // Smooth only the display normals. Original positions, calculations and exports stay untouched.
  if(a.length<900000&&!model.previewOnly)toCreasedNormals(g,Math.PI/4);if(!completeSurface){const colors=new Float32Array(a.length),normals=g.attributes.normal;for(let i=0;i<normals.count;i++){const shade=.58+.35*(normals.getX(i)*.3+normals.getY(i)*.8+normals.getZ(i)*.5);colors[i*3]=colors[i*3+1]=colors[i*3+2]=shade;}g.setAttribute("color",new THREE.BufferAttribute(colors,3));}mesh=completeSurface?new THREE.Mesh(g,material):new THREE.Points(g,new THREE.PointsMaterial({color,size:2.4,sizeAttenuation:false,vertexColors:true}));scene.add(mesh);lastModel=model.id;}
  mesh.scale.set(...factors);material.color.set(color);if(mesh.isPoints)mesh.material.color.set(color);baseSize=model.analysis.dimensions;currentScale=factors;span=Math.max(...baseSize.map((v,i)=>v*factors[i]));
  scene.remove(grid);grid.geometry.dispose();(Array.isArray(grid.material)?grid.material:[grid.material]).forEach(m=>m.dispose());grid=new THREE.GridHelper(span*4,40,0x666972,0x41454b);grid.position.y=-baseSize[1]*factors[1]/2-span*.04;grid.visible=this.gridVisible!==false;scene.add(grid);
 },clear(){if(mesh){scene.remove(mesh);mesh.geometry.dispose();if(mesh.isPoints)mesh.material.dispose();mesh=null;}lastModel=null;},fit,
 toggleProjection(){orthographic=!orthographic;const old=camera;camera=orthographic?new THREE.OrthographicCamera(-1,1,1,-1,.01,10000):new THREE.PerspectiveCamera(36,old.aspect,.01,10000);camera.aspect=old.aspect;camera.position.copy(old.position);camera.up.copy(old.up);controls.object=camera;const direction=old.position.clone().sub(controls.target).normalize();const up=old.up.clone();fit();const distance=camera.position.length();camera.position.copy(direction.multiplyScalar(distance));camera.up.copy(up);controls.update();return orthographic;},
 setAxisView(axis){if(!orthographic)this.toggleProjection();fit(axis);const button=document.getElementById('projectionBtn');button.textContent='正交';button.setAttribute('aria-pressed','true');return axis;},
 snapOrthographic(){return this.setAxisView(nearestAxis());},
 setWire(value){material.wireframe=value;material.roughness=value?.6:.27;},gridVisible:false,
 toggleGrid(){this.gridVisible=!this.gridVisible;grid.visible=this.gridVisible;return grid.visible;},
 start(){renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);orientation.draw();});}
 };
 function snapWhileDragging(){if(!middleDragging||dragMode!=='rotate'||altSnapped)return;altSnapped=true;controls.noRotate=true;controls._lastAngle=0;controls._movePrev.copy(controls._moveCurr);document.getElementById('viewSelect').value=api.snapOrthographic();}
 function releaseSnap(){if(!altSnapped)return;const position=controls._getMouseOnCircle(lastPointer.x,lastPointer.y);controls._movePrev.copy(position);controls._moveCurr.copy(position);controls._lastAngle=0;controls.noRotate=false;altSnapped=false;}
 window.addEventListener('keydown',e=>{if(e.key==='Alt')snapWhileDragging();});
 window.addEventListener('keyup',e=>{if(e.key==='Alt')releaseSnap();});
 window.addEventListener('blur',()=>{middleDragging=false;releaseSnap();});
 renderer.domElement.addEventListener('pointerup',e=>{if(e.button!==1)return;middleDragging=false;releaseSnap();controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;});
 renderer.domElement.addEventListener('pointercancel',()=>{middleDragging=false;releaseSnap();controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;});
 return api;
}

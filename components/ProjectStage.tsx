'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {projectModels} from '@/lib/project-models';
import HardwareAnnotations from './HardwareAnnotations';
import type {ProjectMotion} from '@/lib/projects';
export default function ProjectStage({motion,active,phase}:{motion:ProjectMotion;active:number;phase:number}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current!;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{el.dataset.unavailable='true';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x0a0a0a,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.domElement.setAttribute('aria-hidden','true');el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,60);camera.position.z=10;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.02);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.AmbientLight(0xe6dfd0,.7));const key=new T.DirectionalLight(0xffddb0,2);key.position.set(-4,6,7);scene.add(key);const rim=new T.DirectionalLight(0xe4e8e8,2.3);rim.position.set(5,3,-2);scene.add(rim);
  const models=projectModels();models.forEach(m=>scene.add(m));
  const originalMaterials=new Set<T.Material>();
  models.slice(3).forEach(model=>model.children.forEach(part=>{const copies=new Map<T.Material,T.Material>();part.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial){const original=o.material;originalMaterials.add(original);let material=copies.get(original) as T.MeshStandardMaterial|undefined;if(!material){material=original.clone();material.userData.glow=material.emissiveIntensity;copies.set(original,material);}o.material=material;}});}));
  const baseRotations=models.map(m=>m.rotation.clone());
  const materials=models.map(model=>{const list:T.Material[]=[];model.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.userData.baseOpacity=m.opacity;m.transparent=true;list.push(m);}}});return list;});
  let ww=1,wh=1,frame=0,last=0,time=0,mx=0,my=0;
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();wh=2*Math.tan(Math.PI/10)*10;ww=wh*w/h;};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const pointer=(e:PointerEvent)=>{if(!matchMedia('(hover:hover)').matches)return;mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;};window.addEventListener('pointermove',pointer,{passive:true});
  const ease=(v:number)=>{const n=T.MathUtils.clamp(v,0,1);return n*n*(3-2*n);};
  const render=(now:number)=>{frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.04);last=now;if(document.hidden)return;if(!motion.reduced)time+=dt;
   const index=Math.min(4,Math.floor(motion.position+.001)),p=(motion.position-index)/.82,structure=ease((p-.18)/.15),interfacePhase=ease((p-.59)/.075);
   models.forEach((model,i)=>{model.visible=i===index;if(!model.visible)return;
    let opacity=i<2?1-interfacePhase:i===2?ease((p-.30)/.035)*(1-interfacePhase):i===3?ease((p-.47)/.04):1;
    const quadFraming=6.5+2*ease((p-.40)/.35)*(1-(motion.handoff||0));
    const base=Math.min(ww/(i===4?4.6:i===1?5.3:4.0),wh/(i===4?quadFraming:i===3?6.4:4.0));model.scale.setScalar(base);model.position.set(0,0,0);
    model.rotation.set(baseRotations[i].x,baseRotations[i].y+(motion.reduced?0:Math.sin(time*.06)*.07+mx*.04),baseRotations[i].z);
    const opening=i>=3?ease((p-.40)/.35):structure*.23;
    model.children.forEach(child=>{const home=child.userData.home as T.Vector3|undefined,offset=child.userData.explode as T.Vector3|undefined,target=child.userData.target as T.Vector3|undefined;if(home&&offset){const spread=i===3?ease((p-.5-(child.userData.stage||0)*.065)/.19):opening;child.position.copy(home).addScaledVector(offset,spread*(1-(motion.handoff||0)));}if(home&&target){
      if(i===1&&typeof child.userData.flowIndex==='number'&&!motion.reduced){const t=((child.userData.flowIndex+.5)/4+time*.008)%1;const flow=new T.Vector3(-2.2+t*4.4,Math.sin(t*Math.PI*2)*.55,(t-.5)*.8);child.position.copy(flow).lerp(target,structure);child.userData.flowOpacity=structure+(1-structure)*ease(Math.min(t,1-t)/.07);}else child.position.copy(home).lerp(target,structure);
     }});
    materials[i].forEach(m=>m.opacity=m.userData.baseOpacity*opacity*(1-(motion.handoff||0)));
    if(i===1)model.children.forEach(child=>{if(child instanceof T.Mesh&&typeof child.userData.flowOpacity==='number')(child.material as T.Material).opacity*=child.userData.flowOpacity;if(child instanceof T.Line&&child.userData.flowPath)(child.material as T.Material).opacity*=1-structure;});
   });
   camera.position.x=motion.reduced?0:mx*.035;camera.position.y=motion.reduced?0:-my*.025;camera.lookAt(0,0,0);camera.updateMatrixWorld();
   scene.updateMatrixWorld(true);motion.anchors={};if(index>=3)models[index].children.forEach(child=>{if(!child.name||!child.userData.anchor)return;const anchor=child.localToWorld(child.userData.anchor.clone()).project(camera);motion.anchors![child.name]={x:anchor.x*.5+.5,y:.5-anchor.y*.5};child.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial){o.material.emissiveIntensity=(o.material.userData.glow||0)+(motion.highlight===child.name?.12:0);}});});
   renderer.render(scene,camera);motion.ready=true;
  };frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',pointer);const geometries=new Set<T.BufferGeometry>(),mats=new Set<T.Material>(originalMaterials),textures=new Set<T.Texture>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){mats.add(m);for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);}}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[motion]);
 return <div ref={host} className="project-canvas">{active>=3&&phase===1&&<HardwareAnnotations active={active} motion={motion}/>}</div>;
}

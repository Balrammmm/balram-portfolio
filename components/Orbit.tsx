'use client';
import { useEffect, useRef, useState } from 'react';
import * as T from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildObjects } from '@/lib/orbit-geometry';
import { categories, type FilmState } from '@/lib/film-state';
const visibleCategories=[0,1,2,5,6];
const angles=[2.8,1.62,.36,4.02,5.55];

export default function Orbit({state,onExplore}:{state:FilmState;onExplore:(index:number)=>void}) {
 const host=useRef<HTMLDivElement>(null),labels=useRef<(HTMLButtonElement|null)[]>([]),hits=useRef<(HTMLButtonElement|null)[]>([]);
 const onSelect=useRef(onExplore);onSelect.current=onExplore;
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=host.current!;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x0a0a0a,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.domElement.setAttribute('aria-hidden','true');el.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,60);camera.position.z=12;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.02);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.AmbientLight(0xd2cec4,1.15));const key=new T.DirectionalLight(0xffdfad,2.8);key.position.set(-3,5,6);scene.add(key);const rim=new T.DirectionalLight(0xe4e7ed,2);rim.position.set(4,0,4);scene.add(rim);
  const all=buildObjects(),models=visibleCategories.map(i=>all[i]);
  const wraps=models.map(m=>{const g=new T.Group();g.add(m);scene.add(g);return g;});
  const rotations=models.map(m=>m.rotation.clone());
  const materials=models.map(m=>{const list:T.Material[]=[];m.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){for(const mat of Array.isArray(o.material)?o.material:[o.material]){mat.userData.baseOpacity=mat.opacity;mat.transparent=true;list.push(mat);}}});return list;});
  const paths=[0,1].map(()=>{const line=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(161*3),3)),new T.LineBasicMaterial({color:0xc3a476,transparent:true,opacity:.35}));scene.add(line);return line;});
  const currentScene=el.closest('.mind-scene') as HTMLElement;
  const portrait=currentScene.querySelector<HTMLElement>('.mind-portrait-layer')!,editorial=currentScene.querySelector<HTMLElement>('.mind-editorial')!;
  const focusTitle=document.querySelector<HTMLElement>('.focus-title')!;
  let w=1,h=1,ww=1,wh=1,mobile=false,frame=0,last=0,time=0;
  const resize=()=>{w=el.clientWidth;h=el.clientHeight;mobile=w<701;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();wh=2*Math.tan(T.MathUtils.degToRad(20))*12;ww=wh*w/h;};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const positions=models.map(()=>new T.Vector3()),origin=new T.Vector3(),projected=new T.Vector3(),target=new T.Vector3();let previous=-1;
  const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  const render=(now:number)=>{
   frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.04);last=now;
   if(state.reveal<.001||document.hidden||state.suspended)return;
   if(state.reduced){const r=currentScene.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;}
   const focus=state.focus,selected=visibleCategories.indexOf(state.selected);
   if(selected!==previous&&selected>=0)origin.copy(positions[selected]);previous=selected;
   if(!state.paused&&!state.reduced)time+=dt*(selected>=0?.08:state.hover>=0?.35:1);
   // Shared angular drift prevents overtaking; two radii add depth without crossings.
   const drift=state.reduced?0:time*.018+state.orbit*.055;
   camera.position.set(state.reduced?0:state.mouseX*.035,state.reduced?0:state.mouseY*-.025,12-focus*.6);camera.lookAt(0,0,0);
   const cy=mobile?.60:.60,rx=ww*(mobile?.34:.29),ry=wh*(mobile?.205:.24);
   for(let n=0;n<models.length;n++){
    const angle=angles[n]+drift+(state.reduced?0:Math.sin(time*.045+n)*.055),radius=1+(n%2)*.035,pos=positions[n];
    pos.set(Math.cos(angle)*rx*radius,Math.sin(angle)*ry+(0.5-cy)*wh,Math.sin(angle)*.25);
    if(selected===n){target.set(0,-wh*.04,.4);pos.copy(origin).lerp(target,focus);}
    wraps[n].position.copy(pos);wraps[n].scale.setScalar(wh*(mobile?.039:.064)*state.reveal*(selected===n?1+focus*.4:1));
    models[n].rotation.set(rotations[n].x,rotations[n].y+time*.014,rotations[n].z);
    const dim=selected>=0&&selected!==n?1-focus*.8:1;
    materials[n].forEach(m=>{m.opacity=m.userData.baseOpacity*dim;if(m instanceof T.MeshStandardMaterial){m.emissive.setHex(0x9b7339);m.emissiveIntensity=state.hover===visibleCategories[n]?.1:.008;}});
    projected.copy(pos).project(camera);const px=(projected.x*.5+.5)*w,py=(.5-projected.y*.5)*h;
    const label=labels.current[n],hit=hits.current[n];
    if(label){const lw=label.offsetWidth;const offset=h*(mobile?.048:.064);const lx=mobile?px-lw/2:px-lw/2+Math.cos(angle)*(offset+lw*.5);const ly=mobile?py-48:py-22-Math.sin(angle)*offset;
     label.style.transform=`translate3d(${Math.max(16,Math.min(w-lw-16,lx))}px,${ly}px,0)`;label.style.opacity=String(state.reveal*(1-focus));label.style.pointerEvents=focus>.05?'none':'auto';label.tabIndex=focus<.05&&state.reveal>.9?0:-1;label.classList.toggle('is-hovered',state.hover===visibleCategories[n]);}
    if(hit){hit.style.transform=`translate3d(${px}px,${py}px,0) translate(-50%,-50%)`;hit.style.pointerEvents=focus<.05&&state.reveal>.9?'auto':'none';}
   }
   paths.forEach((path,i)=>{const a=path.geometry.attributes.position as T.BufferAttribute;for(let j=0;j<=160;j++){const t=j/160*Math.PI*2;const x=Math.cos(t)*rx*(1+i*.035),y=Math.sin(t)*ry+(0.5-cy)*wh;const bend=focus*.65;a.setXYZ(j,x*(1-bend),y*(1-bend)-wh*.04*bend,Math.sin(t)*(.25+i*.25));}a.needsUpdate=true;(path.material as T.LineBasicMaterial).opacity=(i===0?.34:.17)*(1-focus*.7);path.geometry.setDrawRange(0,Math.max(2,Math.floor(161*state.reveal)));path.rotation.z=i===0?0:.08;});
   portrait.style.opacity=String(1-focus*.75);editorial.style.opacity=String(1-focus);focusTitle.style.opacity=String(focus*.8);
   renderer.render(scene,camera);
  };frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);
   const geometry=new Set<T.BufferGeometry>(),mats=new Set<T.Material>(),textures=new Set<T.Texture>();
   [...all,...paths].forEach(root=>root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){mats.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}}));
   geometry.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[state]);
 return <><div className="orbit-canvas" ref={host}/><div className={`orbit-labels ${failed?'orbit-static':''}`} aria-label="Explore five disciplines">{visibleCategories.map((i,n)=><div key={i}><button ref={el=>{labels.current[n]=el;}} className="orbit-label" onPointerEnter={()=>{state.hover=i;}} onPointerLeave={()=>{state.hover=-1;}} onFocus={()=>{state.hover=i;}} onBlur={()=>{state.hover=-1;}} onClick={()=>onSelect.current(i)} aria-label={`Explore ${categories[i].toLowerCase()}`}>{categories[i]}</button><button ref={el=>{hits.current[n]=el;}} className="orbit-hit" tabIndex={-1} aria-hidden="true" onPointerEnter={()=>{state.hover=i;}} onPointerLeave={()=>{state.hover=-1;}} onClick={()=>onSelect.current(i)}/></div>)}</div>{failed&&<p className="orbit-unavailable">Choose a discipline to explore.</p>}</>;
}

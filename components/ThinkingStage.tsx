'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {thinkingModels} from '@/lib/thinking-models';
import {clamp,soften,orbitPoint,thinkingHandoff,writingHandoff,type FlowPoint} from '@/lib/story-flow';
import type {StoryMotion} from '@/lib/story';
export default function ThinkingStage({motion}:{motion:StoryMotion}){
 const host=useRef<HTMLDivElement>(null),sculpture=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current!,statue=sculpture.current!,figure=statue.querySelector<HTMLElement>('.statue-frame')!,aura=statue.querySelector<HTMLElement>('.statue-aura')!;
  const back=statue.querySelector<SVGPathElement>('.orbit-back-main')!,rearFront=statue.querySelector<SVGPathElement>('.orbit-back-tail')!,front=statue.querySelector<SVGPathElement>('.orbit-front-main')!;
  const orbitSvgs=statue.querySelectorAll<SVGSVGElement>('.sculpture-orbit');let renderer:T.WebGLRenderer|null=null;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{el.dataset.unavailable='true';}
  if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.domElement.setAttribute('aria-hidden','true');el.prepend(renderer.domElement);}
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,50);camera.position.set(.8,2.3,8.2);camera.lookAt(0,.55,0);
  scene.add(new T.HemisphereLight(0xede5d5,0x090b0b,1.1));const key=new T.DirectionalLight(0xffddb0,3.4);key.position.set(-3,5,4);scene.add(key);const rim=new T.DirectionalLight(0xc9b48c,2.1);rim.position.set(3,2,-3);scene.add(rim);
  const world=new T.Group();scene.add(world);const {market,candles,path,chart,materials}=thinkingModels();world.add(market);
  // One projected chart becomes two depth-ordered arcs, never a second hoop.
  path.geometry.dispose();(path.material as T.Material).dispose();
  const baseOpacity=materials.map(m=>m.opacity);
  let frame=0,last=-1,lastWebGL=-1,mx=0,my=0,cx=0,cy=0,lastTime=0,orbitTime=0;
  let width=1,height=1,figureWidth=1,figureHeight=1,figureLeft=0,figureTop=0;
  const projected:FlowPoint[]=chart.map(()=>({x:0,y:0})),scratch=new T.Vector3();
  const resize=()=>{
   width=el.clientWidth;height=el.clientHeight;if(!width||!height)return;
   renderer?.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();camera.updateMatrixWorld();
   world.scale.setScalar(Math.min(1,width/height*.95));world.updateMatrixWorld(true);
   figureWidth=figure.offsetWidth;figureHeight=figure.offsetHeight;figureLeft=(width-figureWidth)/2;figureTop=height-figureHeight;
   orbitSvgs.forEach(svg=>svg.setAttribute('viewBox',`0 0 ${width} ${height}`));
   chart.forEach((point,i)=>{scratch.copy(point).applyMatrix4(world.matrixWorld).project(camera);projected[i].x=(scratch.x+1)*width/2;projected[i].y=(1-scratch.y)*height/2;});
   const viewport=el.closest<HTMLElement>('.story-viewport');
   if(viewport)motion.chartPoints=projected.map(point=>({x:(el.offsetLeft+point.x)/viewport.clientWidth*1000,y:(el.offsetTop+point.y)/viewport.clientHeight*1000}));
   last=-1;
  };const observer=new ResizeObserver(resize);observer.observe(el);observer.observe(figure);resize();
  const pointer=(e:PointerEvent)=>{if(motion.reduced||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const rect=el.getBoundingClientRect();mx=T.MathUtils.clamp((e.clientX-rect.left)/rect.width-.5,-.5,.5);my=T.MathUtils.clamp((e.clientY-rect.top)/rect.height-.5,-.5,.5);};window.addEventListener('pointermove',pointer,{passive:true});
  const render=(now:number)=>{
   frame=requestAnimationFrame(render);const dt=Math.min(50,lastTime?now-lastTime:16.67);lastTime=now;
   if(document.hidden||motion.position<3.35||motion.position>6.15)return;
   const actual=thinkingHandoff(motion.position),p=motion.reduced?(actual.p<.5?.28:.85):actual.p;
   const reveal=soften(p/.18),philosophy=soften((p-.44)/.16),idle=philosophy>0&&!motion.reduced&&!motion.paused;
   const moving=Math.abs(mx-cx)+Math.abs(my-cy)>.001;if(Math.abs(p-last)<.00001&&!moving&&!idle)return;last=p;
   const damping=1-Math.exp(-dt/220);cx+=(mx-cx)*damping;cy+=(my-cy)*damping;if(idle)orbitTime+=dt/1000;
   materials.forEach((m,i)=>m.opacity=baseOpacity[i]*(1-philosophy));market.visible=philosophy<.999;
   candles.forEach((c,i)=>c.scale.y=Math.max(.001,soften((reveal-i*.04)/.65)));
   const segments:string[]=[];
   for(let i=0;i<chart.length;i++){
    const end=orbitPoint(i/(chart.length-1),figureWidth,figureHeight,orbitTime/22*Math.PI*2),start=projected[i];
    segments.push(`${(start.x+(figureLeft+end.x-start.x)*philosophy).toFixed(2)} ${(start.y+(figureTop+end.y-start.y)*philosophy).toFixed(2)}`);
   }
   const middle=(chart.length-1)/2,backD=`M${segments.slice(0,middle+1).join(' L')}`,frontD=`M${segments.slice(middle).join(' L')}`;
   back.setAttribute('d',backD);rearFront.setAttribute('d',frontD);front.setAttribute('d',frontD);
   const transfer=writingHandoff(motion.position).transfer,depth=soften((philosophy-.2)/.8);
   back.style.opacity=String((.6-.28*philosophy)*transfer);rearFront.style.opacity=String(.6*(1-depth)*transfer);front.style.opacity=String(.50*depth*transfer);
   const draw=soften((motion.position-3.35)/.20);back.style.strokeDashoffset=String(1-clamp(draw*2));rearFront.style.strokeDashoffset=String(1-clamp((draw-.5)*2));front.style.strokeDashoffset='0';
   figure.style.opacity=String(philosophy);aura.style.opacity=String(philosophy);
   statue.style.transform=`perspective(1000px) translate3d(${motion.reduced?0:cx*5*philosophy}px,${motion.reduced?0:cy*3*philosophy}px,0) rotateY(${motion.reduced?0:(cx*2+(p-.6)*3)*philosophy}deg) scale(${motion.reduced?1:1-(1-philosophy)*.02*philosophy})`;
   if(philosophy<1||lastWebGL!==philosophy){renderer?.render(scene,camera);lastWebGL=philosophy;}
  };frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',pointer);const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){gs.add(o.geometry);ms.add(o.material as T.Material);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());if(renderer){renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
 },[motion]);
 return <div className="thinking-stage finance-philosophy" ref={host}><div ref={sculpture} className="philosopher-image"><div className="statue-aura"/><svg className="sculpture-orbit orbit-back" aria-hidden="true"><path className="orbit-back-main" pathLength="1"/><path className="orbit-back-tail" pathLength="1"/></svg><div className="statue-frame"><img src="/story/philosopher-cutout.png" alt="Classical stone philosopher seated with an open book" width="1152" height="2048" loading="lazy" decoding="async"/></div><svg className="sculpture-orbit orbit-front" aria-hidden="true"><path className="orbit-front-main" pathLength="1"/></svg></div><span className="thinking-fallback" aria-hidden="true">INFORMATION · PROBABILITY · UNCERTAINTY</span></div>;
}

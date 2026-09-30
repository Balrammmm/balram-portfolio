'use client';
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import GlobalHeader,{type NavTarget} from './GlobalHeader';
import {PulseVisual,RetailVisual} from './DataVisuals';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {projects,type ProjectMotion} from '@/lib/projects';
import '../app/projects.css';
const ProjectStage=dynamic(()=>import('./ProjectStage'),{ssr:false});
gsap.registerPlugin(ScrollTrigger);
const sceneTitles=[['Ideas deserve due diligence.','Five questions. One clearer decision.','From assumptions to evidence.'],['From noise to signal.','Listen for what keeps recurring.','Customer voices. Product decisions.'],['Data that drives decisions.','One model. Connected perspectives.','From relationships to insight.'],['A small robot.\nA larger question.','Built to meet the real world.'],['Control begins with instability.','A system of interdependent parts.']];
const sceneCopy=[
 ['An AI venture validation platform. Examine an idea before committing to the build.','Separate the idea into market, customer, business model, risk and evidence. Each question gives the next decision a stronger foundation.','The product brings that investigation into a single validation workspace. Explore the actual interface, then try a venture of your own.'],
 ['Upload a review CSV, analyse recurring themes and turn customer feedback into a report of actionable product recommendations.','Review fragments become four useful signals: sentiment, pain points, loved features and feature requests.','A customer intelligence workspace for understanding recurring needs and deciding what to improve next.'],
 ['Transforms transaction-level retail data into a structured analytical model for revenue, margin, customer, category and channel analysis.','Orders connect to customers, products, dates, sales channels and locations. A star schema creates one analytical foundation.','Read revenue, gross profit, margin and orders through the same model. Compare by date, product, customer, channel or location.'],
 ['A four-wheel prototype exploring attention, awareness and assistance. OLED eyes, a speaker, exposed wiring and a chassis built to learn on.','The display, perception, power and motion systems work together. Building NEO meant learning from noisy sensors, imperfect environments and real hardware.'],
 ['A first-year engineering experiment in sensing, motor response and control. A small aircraft made the feedback loop tangible.','A first-year flight-control hardware experiment: sensor acquisition, motor-response logic, calibration and debugging. Scroll to separate the control, sensing, power and mechanical layers.']
];
function NeoPhoto(){return <Image className="neo-main" src="/projects/neo-clean.png" width={1536} height={1024} sizes="(max-width:700px) 76vw, 48vw" alt="NEO prototype with OLED eyes, speaker, exposed wiring and four wheels"/>;}

export default function ProjectJourney({initialIndex,onReturn,onContinue,onNavigate}:{initialIndex:number;onReturn:()=>void;onContinue:()=>void;onNavigate:(target:NavTarget)=>void}){
 const root=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null),smooth=useRef<Lenis|null>(null);
 const motion=useRef<ProjectMotion>({position:initialIndex,reduced:false,ready:false});
 const closing=useRef(false),switching=useRef(false),entrance=useRef<gsap.core.Animation|null>(null),switchTween=useRef<gsap.core.Animation|null>(null);
 const [active,setActive]=useState(initialIndex),[phase,setPhase]=useState(0);
 const closeRef=useRef(onReturn);closeRef.current=onReturn;
 const continueRef=useRef(onContinue);continueRef.current=onContinue;
 const project=projects[active],count=active>=3?2:3;
 function continueStory(){if(closing.current||switching.current)return;closing.current=true;smooth.current?.stop();entrance.current?.kill();switchTween.current?.kill();const duration=motion.current.reduced?.1:1.35;switchTween.current=gsap.timeline({onComplete:()=>continueRef.current()}).to(motion.current,{handoff:1,duration,ease:'power2.inOut'},0).to(root.current!.querySelectorAll('.project-copy,.project-header,.project-footer,.hardware-annotations'),{opacity:0,duration:duration*.7},0).fromTo(root.current!.querySelector('.project-bridge'),{opacity:0,scale:.97},{opacity:1,scale:1,duration,ease:'power2.inOut'},0);}
 function returnToOrbit(){if(closing.current)return;closing.current=true;smooth.current?.stop();entrance.current?.kill();switchTween.current?.kill();entrance.current=gsap.to(root.current,{autoAlpha:0,y:24,duration:motion.current.reduced?.15:.65,ease:'power2.inOut',onComplete:()=>closeRef.current()});}
 useEffect(()=>{
  const el=root.current!,previous=document.activeElement as HTMLElement|null,html=document.documentElement;
  const overflow=html.style.overflow;html.style.overflow='hidden';
  entrance.current=gsap.fromTo(el,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?.15:.65,ease:'power2.inOut'});
  const focus=window.setTimeout(()=>el.querySelector<HTMLButtonElement>('.journey-return')?.focus({preventScroll:true}),80);
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();returnToOrbit();}if(event.key==='Tab'){const nodes=Array.from(el.querySelectorAll<HTMLElement>('button,a[href]')).filter(n=>!n.hasAttribute('disabled')&&n.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key);
  return()=>{clearTimeout(focus);window.removeEventListener('keydown',key);entrance.current?.kill();switchTween.current?.kill();html.style.overflow=overflow;previous?.focus({preventScroll:true});};
 },[]);
 useEffect(()=>{
  const el=root.current!,content=track.current!;let refresh=0;
  const media=gsap.matchMedia();
  media.add({reduce:'(prefers-reduced-motion: reduce)',normal:'(prefers-reduced-motion: no-preference)'},ctx=>{
   motion.current.reduced=!!ctx.conditions?.reduce;motion.current.position=active;
   const lenis=new Lenis({wrapper:el,content,lerp:.1,smoothWheel:!motion.current.reduced});smooth.current=lenis;lenis.scrollTo(0,{immediate:true});
   const ticker=(time:number)=>lenis.raf(time*1000);gsap.ticker.add(ticker);lenis.on('scroll',ScrollTrigger.update);
   const control={progress:0};
   const tween=gsap.to(control,{progress:1,ease:'none',onUpdate:()=>{const p=control.progress;motion.current.position=active+p*.82;setPhase(Math.min(count-1,Math.floor(p*count)));if(active===4&&p>.999&&!motion.current.reduced)continueStory();},scrollTrigger:{trigger:content,scroller:el,start:'top top',end:'bottom bottom',scrub:motion.current.reduced?true:.5}});
   refresh=requestAnimationFrame(()=>ScrollTrigger.refresh());
   return()=>{cancelAnimationFrame(refresh);tween.scrollTrigger?.kill();tween.kill();gsap.ticker.remove(ticker);lenis.destroy();};
  },el);
  return()=>media.revert();
 },[active,count]);
 function seek(nextPhase:number){smooth.current?.scrollTo((track.current!.offsetHeight-root.current!.clientHeight)*(nextPhase/count+.08),{duration:motion.current.reduced?0:1.1,force:true});}
 function go(index:number){if(closing.current||switching.current)return;if(index>4){continueStory();return;}switching.current=true;
  switchTween.current=gsap.to(viewport.current,{opacity:0,y:-12,duration:motion.current.reduced?.1:.25,onComplete:()=>{motion.current.position=index;setActive(index);setPhase(0);requestAnimationFrame(()=>{smooth.current?.scrollTo(0,{immediate:true});switchTween.current=gsap.fromTo(viewport.current,{opacity:0,y:12},{opacity:1,y:0,duration:.4,onComplete:()=>{switching.current=false;}});});}});
 }
 const showUI=phase===2&&active<2;
 return <div ref={root} className="project-journey" role="dialog" aria-modal="true" aria-labelledby="journey-title" data-lenis-prevent>
  <div ref={track} className="project-track" style={{height:`${count*110}svh`}}><div ref={viewport} className="project-viewport" data-project={project.id} data-phase={phase}>
   <GlobalHeader active="projects" onNavigate={onNavigate}/>
   <svg className="project-bridge" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M-80 840 C320 720 380 240 700 390 S990 730 1080 80"/></svg>{(active===0||active>=3)&&<ProjectStage motion={motion.current} active={active} phase={phase}/>}
   <section className={`project-panel project-${project.id}`} aria-label={project.name}>
    <div className="project-copy"><p className="project-act">{active>=3?'HARDWARE':'SELECTED WORK'} / 0{active+1}</p><h2 id="journey-title">{project.name}</h2>
     <div className="project-story" key={`${active}-${phase}`}><p className="project-line">{sceneTitles[active][phase]}</p><p className="project-description">{sceneCopy[active][phase]}</p>
      {phase===1&&active===0&&<ul className="concept-list">{project.dimensions.map(label=><li key={label}>{label}</li>)}</ul>}
     </div>
     {active===3&&phase===1&&<div className="neo-software"><span>EYES → SIGNAL → ATTENTION</span><span>CLASSIFICATION → RESPONSE</span><small>Python / OpenCV / MediaPipe / Random Forest</small></div>}
     <div className="project-actions">{phase<count-1?<button className="project-explore" onClick={()=>seek(phase+1)}>{phase===0?'EXPLORE PROJECT':'SEE THE RESULT'} <span>→</span></button>:project.live?<a className="project-explore" href={project.live} target="_blank" rel="noopener noreferrer">OPEN LIVE PRODUCT ↗</a>:<button className="project-explore" onClick={()=>go(active+1)}>{active===4?'BEYOND THE PROJECTS':'NEXT PROJECT'} →</button>}</div>
     {phase===0&&(active===1||active===2)&&<p className="project-stat">{active===1?'500K+ REVIEW WORKFLOWS':'56K+ ORDER LINES'}</p>}
    </div>
    {active===3&&phase===0&&<NeoPhoto/>}
    {active===1&&<PulseVisual phase={phase}/>}
    {active===2&&<RetailVisual phase={phase} motion={motion.current}/>}
    {showUI&&<figure className="product-interface"><img src={`/projects/${project.image}`} alt={`Actual ${project.name} product interface`} decoding="async"/><figcaption>THE PRODUCT / {active===0?'VALIDATION WORKSPACE':'CUSTOMER INTELLIGENCE'}</figcaption></figure>}
    {active===2&&phase===0&&<div className="raw-data"><span>RAW DATA</span><div className="data-head"><span>FIELD</span><span>SOURCE DATA</span><span>RECORDS</span></div>{['Customer','Date','Quantity','Revenue','Location'].map((field,i)=><div key={field}><span>0{i+1}</span><span>{field}</span><i/></div>)}</div>}
    {active===2&&phase===2&&<div className="retail-insight"><span>KPIs / INSIGHT</span><h3>One model.<br/>Better questions.</h3><div>{['Revenue','Gross profit','Margin','Orders'].map(t=><p key={t}>{t}<span>↗</span></p>)}</div><small>BY DATE · PRODUCT · CUSTOMER · CHANNEL · LOCATION</small></div>}
   </section>
   <footer className="project-footer"><div className="project-stage-list"><button className="journey-return" onClick={returnToOrbit}>← RETURN</button>{Array.from({length:count},(_,i)=><button key={i} data-current={phase===i} onClick={()=>seek(i)} aria-label={`Scene ${i+1}`}>0{i+1}</button>)}</div><span>{phase+1} / {count}</span><button className="project-next" onClick={()=>go(active+1)}>{active===4?'BEYOND THE PROJECTS':'NEXT PROJECT'} →</button></footer>
  </div></div>
 </div>;
}


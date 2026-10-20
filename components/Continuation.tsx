'use client';
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {CustomEase} from 'gsap/CustomEase';
import Lenis from 'lenis';
import BookObjects from './BookObjects';
import Signature from './Signature';
import GlobalHeader,{type NavTarget} from './GlobalHeader';
import {chapterNames,proof,resumes,type StoryMotion} from '@/lib/story';
import {bridgePath,writingHandoff,thinkingHandoff,soften} from '@/lib/story-flow';
import '../app/continuation.css';
const ThinkingStage=dynamic(()=>import('./ThinkingStage'),{ssr:false});
gsap.registerPlugin(ScrollTrigger,CustomEase);
const flowEase=CustomEase.create('story-flow','0.22,1,0.36,1');
const bounds=[0,1.6,3.4,6.1,9.5,11,12.5];
const thinking=[['FINANCE','Where numbers meet human behaviour.','Markets interest me because information, incentives and uncertainty occupy the same system.'],['PHILOSOPHY','First principles before fashionable answers.','Question the premise. Make the reasoning visible. Stay willing to change your mind.']];
export default function Continuation({initialChapter=0,returnLabel='ORBIT',onReturn,onNavigate,onReady}:{initialChapter?:number;returnLabel?:'HERO'|'ABOUT'|'ORBIT';onReturn:()=>void;onNavigate:(target:NavTarget)=>void;onReady?:()=>void}){
 const root=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),panels=useRef<(HTMLElement|null)[]>([]),smooth=useRef<Lenis|null>(null),motion=useRef<StoryMotion>({position:bounds[initialChapter],reduced:false,paused:false});
 const [chapter,setChapter]=useState(initialChapter),[thinkingStep,setThinkingStep]=useState(0),[proofIndex,setProofIndex]=useState(0),[phone,setPhone]=useState(false),[paused,setPaused]=useState(false),[loadThinking,setLoadThinking]=useState(initialChapter>=2);
 const exit=useRef<gsap.core.Tween|null>(null),closing=useRef(false),returnRef=useRef(onReturn);returnRef.current=onReturn;
 const readyRef=useRef(onReady);readyRef.current=onReady;
 function close(){if(closing.current)return;closing.current=true;smooth.current?.stop();exit.current=gsap.to(root.current,{opacity:0,duration:motion.current.reduced?.1:.55,onComplete:()=>returnRef.current()});}
 function seekPosition(position:number){if(closing.current)return;smooth.current?.scrollTo((track.current!.offsetHeight-root.current!.clientHeight)*position/12.5,{duration:motion.current.reduced?0:1.2,easing:flowEase,force:true});}
 function seek(i:number){if(i<0||i>5)return;seekPosition(bounds[i]+(i===2?.32:.12));}
 useEffect(()=>{
  const el=root.current!,content=track.current!,html=document.documentElement,oldOverflow=html.style.overflow,previous=document.activeElement as HTMLElement|null;html.style.overflow='hidden';
  const mq=gsap.matchMedia();let focusTimer=0;
  mq.add({reduce:'(prefers-reduced-motion: reduce)',normal:'(prefers-reduced-motion: no-preference)'},ctx=>{
   const reduced=!!ctx.conditions?.reduce;motion.current.reduced=reduced;const lenis=new Lenis({wrapper:el,content,lerp:.09,smoothWheel:!reduced});smooth.current=lenis;
   const ticker=(t:number)=>lenis.raf(t*1000);gsap.ticker.add(ticker);lenis.on('scroll',ScrollTrigger.update);
   const entryPosition=bounds[initialChapter]+(initialChapter===2?.32:.08);
   const thread=el.querySelector<SVGPathElement>('.journey-line path')!,value={position:entryPosition};
   const copies=el.querySelectorAll<HTMLElement>('.thinking-copy');
   const library=el.querySelector('.library-objects');
   const annotations=el.querySelector('.finance-annotations');
   const enter=gsap.fromTo(el,{opacity:0},{opacity:1,duration:reduced?.1:.8});
   const portalEnter=initialChapter===4?gsap.fromTo(el.querySelectorAll('.portal-entry'),{opacity:0,y:reduced?0:28},{opacity:1,y:0,duration:reduced?.1:1.1,stagger:reduced?0:.14,ease:'power2.out',delay:reduced?0:.15}):null;
   const update=()=>{
    const pos=value.position;motion.current.position=pos;let current=5;for(let i=0;i<6;i++)if(pos<bounds[i+1]){current=i;break;}setChapter(current);if(current>=1)setLoadThinking(true);
    const handoff=writingHandoff(pos),thought=thinkingHandoff(pos);
    setThinkingStep(thought.p<.5?0:1);setProofIndex(Math.min(5,Math.max(0,Math.floor((pos-6.1)/3.4*6))));
    panels.current.forEach((panel,i)=>{if(!panel)return;const local=(pos-bounds[i])/(bounds[i+1]-bounds[i]);const enter=i===0?1:Math.max(0,Math.min(1,(pos-bounds[i]+.10)/.10));const leave=i===5?1:Math.max(0,Math.min(1,(bounds[i+1]-pos)/.10));let opacity=Math.min(enter,leave),y=local<.1?(1-local/.1)*20:local>.9?-(local-.9)*140:0;
     if(i===1&&pos>=3.05){opacity=1-handoff.out;y=-handoff.out*14;}
     if(i===2){opacity=Math.min(handoff.incoming,leave);y=local>.9?-(local-.9)*140:0;}
     if(reduced)opacity=i===current?1:0;gsap.set(panel,{autoAlpha:opacity,y:reduced?0:y});panel.inert=i!==current;panel.setAttribute('aria-hidden',String(i!==current));});
    copies.forEach((copy,i)=>{const opacity=reduced?(i===(thought.p<.5?0:1)?1:0):i===0?thought.finance:thought.philosophy;gsap.set(copy,{autoAlpha:opacity,y:reduced?0:i===0?(1-handoff.incoming)*14-(1-thought.finance)*12:(1-thought.philosophy)*14});copy.setAttribute('aria-hidden',String(opacity===0));});
    const finance=Math.min(1,pos/1.1);gsap.set(el.querySelector('.responsibility-value'),{scale:1-finance*.28,y:-finance*22});gsap.set(el.querySelector('.financial-flow'),{opacity:Math.min(1,pos/.35),y:(1-finance)*20});
    const metric=(pos-6.1)/3.4*6,part=metric-Math.floor(metric);gsap.set(el.querySelector('.proof-monolith'),{scale:reduced?1:1.08-part*.14,y:reduced?0:20-part*40,opacity:current===3?Math.min(1,part/.12,(1-part)/.12):1});
    const local=Math.max(0,Math.min(1,(pos-bounds[current])/(bounds[current+1]-bounds[current]))),mix=local*local*(3-2*local);const xs=[740,650,560,500,500,620,740],bs=[55,15,90,0,40,16,0];const lineX=xs[current]+(xs[current+1]-xs[current])*mix,bend=bs[current]+(bs[current+1]-bs[current])*mix;const closePortals=reduced?0:Math.max(0,Math.min(1,(pos-10.65)/.35));el.querySelectorAll<HTMLElement>('.resume-portal').forEach((portal,i)=>{if(closePortals>0)gsap.set(portal,{xPercent:(i===0?1:-1)*closePortals*50,scaleX:1-closePortals*.98});else gsap.set(portal,{clearProps:'transform'});});
    const split=Math.max(0,Math.min(1,(pos-9.1)/.4));gsap.set(el.querySelector('.proof-forms'),{opacity:current===3?split:0,scaleX:reduced?1:.08+split*.92,scaleY:reduced?1:.55+split*.45});
    thread.setAttribute('d',`M-80 840 C${lineX-420} ${760-bend} ${lineX-380} 240 ${lineX-40} 390 S${lineX+250} ${730+bend} 1080 80`);
    if(pos>=3.05&&pos<6.1&&motion.current.chartPoints)thread.setAttribute('d',bridgePath(motion.current.chartPoints,handoff.bridge));
    // The global signal hands ownership to the local chart/orbit, then stays hidden.
    const signalOpacity=pos<3.05?1:pos<6.1?1-handoff.transfer:soften((pos-6.1)/.22);
    gsap.set(thread,{opacity:signalOpacity,strokeDashoffset:pos>=3.05&&pos<3.55?.06*Math.sin(handoff.bridge*Math.PI):0});
    const pageClose=soften((pos-3.05)/.35);gsap.set(library,{rotateY:reduced?0:pageClose*76,opacity:1-pageClose});
    gsap.set(annotations,{autoAlpha:current===2?soften((pos-3.58)/.18)*thought.finance:0});
   };
   // Lenis owns smoothing; a second scrub tween added lag to every button/scroll.
   const tween=gsap.fromTo(value,{position:0},{position:12.5,ease:'none',onUpdate:update,scrollTrigger:{trigger:content,scroller:el,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
   value.position=entryPosition;update();
   const refresh=requestAnimationFrame(()=>{ScrollTrigger.refresh();lenis.scrollTo((content.offsetHeight-el.clientHeight)*entryPosition/12.5,{immediate:true});tween.scrollTrigger?.update();update();readyRef.current?.();});
   return()=>{cancelAnimationFrame(refresh);enter.kill();portalEnter?.kill();tween.scrollTrigger?.kill();tween.kill();gsap.ticker.remove(ticker);lenis.destroy();};
  },el);
  focusTimer=window.setTimeout(()=>el.querySelector<HTMLButtonElement>('.story-return')?.focus({preventScroll:true}),100);
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const nodes=Array.from(el.querySelectorAll<HTMLElement>('button,a[href]')).filter(n=>!n.closest('[inert]')&&n.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};window.addEventListener('keydown',key);
  return()=>{clearTimeout(focusTimer);window.removeEventListener('keydown',key);exit.current?.kill();mq.revert();html.style.overflow=oldOverflow;previous?.focus({preventScroll:true});};
 },[initialChapter]);
 const localMetric=proof[proofIndex];
 return <div ref={root} className="story-journey" role="dialog" aria-modal="true" aria-label="Beyond the projects — ACT 03 to 08" data-lenis-prevent data-paused={paused}>
  <div ref={track} className="story-track"><div className="story-viewport" data-chapter={chapter}>
   <GlobalHeader active={chapter===4?'resume':chapter===5?'contact':undefined} onNavigate={target=>{if((target==='resume'&&chapter===4)||(target==='contact'&&chapter===5))return;onNavigate(target);}}/>
   <svg className="journey-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" strokeDasharray="1" d="M-80 840 C320 720 380 240 700 390 S990 730 1080 80"/></svg>
   <section ref={el=>{panels.current[0]=el;}} className="story-scene responsibility" aria-labelledby="responsibility-title">
    <div className="story-intro"><p className="story-label">ACT 03 / BEYOND THE BUILD · IIC · THAPAR · 2024–2026</p><h2 id="responsibility-title">Responsibility,<br/><em>measured.</em></h2><p className="story-quote">Budgets are decisions<br/>with consequences.</p><p className="story-copy">Finance Secretary<br/>Institution’s Innovation Council</p></div>
    <div className="financial-stage"><div className="responsibility-value">₹2,00,000<span>+</span></div><p className="story-label financial-caption">FINANCIAL RESPONSIBILITY</p><div className="financial-flow"><ol>{['PLAN','ALLOCATE','TRACK','RECONCILE','REPORT'].map((t,i)=><li key={t}><span>0{i+1}</span>{t}</li>)}</ol><div className="initiative-lines" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div><p className="story-label">8+ INSTITUTIONAL INITIATIVES</p></div></div>
    <p className="responsibility-note story-copy">Resource allocation. Expense tracking.<br/>Reconciliation, reporting and coordination.</p>
   </section>
   <section ref={el=>{panels.current[1]=el;}} className="story-scene writing" aria-labelledby="writing-title">
    <div className="story-intro"><p className="story-label">ACT 04 / WRITING</p><h2 id="writing-title">Words that<br/>outlive <em>the tab.</em></h2><p className="story-quote">I write to force ambiguity<br/>into structure.</p><p className="story-copy">Writing is where scattered thought<br/>becomes architecture.</p><p className="story-label writing-count">5+ DIGITAL WORKS<br/>PUBLISHED UNDER STERLING MORIZ</p></div><BookObjects/>
   </section>
   <section ref={el=>{panels.current[2]=el;}} className="story-scene thinking" aria-labelledby={`thinking-title-${thinkingStep}`}>
    {thinking.map((copy,i)=><div className="story-intro thinking-copy" key={copy[0]}><p className="story-label">ACT 05 / WAYS OF THINKING</p><h2 id={`thinking-title-${i}`}>{copy[0]}</h2><p className="story-quote">{copy[1]}</p><p className="story-copy">{copy[2]}</p><p className="thinking-sequence story-label">FINANCE <span>→</span> PHILOSOPHY</p></div>)}{loadThinking&&<ThinkingStage motion={motion.current}/>}<div className="finance-annotations"><span>PROBABILITY<small>0 · 0.5 · 1</small></span><span>RISK / REWARD<small>Illustrative decision geometry</small></span></div>
   </section>
   <section ref={el=>{panels.current[3]=el;}} className="story-scene proof" data-source={localMetric.source} aria-labelledby="proof-title">
    <div className="proof-heading"><p className="story-label">ACT 06 / EVIDENCE</p><h2 id="proof-title">Proof of work.</h2><p className="story-copy">Numbers aren’t everything.<br/>But they leave evidence.</p></div><div className="proof-monolith"><strong>{localMetric.value}</strong><p>{localMetric.label}</p></div><div className="proof-trace" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div><div className="proof-forms portals" aria-hidden="true"><i/><i/></div><p className="proof-index story-label">0{proofIndex+1} / 06</p>
   </section>
   <section ref={el=>{panels.current[4]=el;}} className="story-scene resume-portals" aria-labelledby="portals-title">
    <div className="portal-heading"><p className="story-label">ACT 07 / RÉSUMÉS</p><h2 id="portals-title">Choose your <em>lens.</em></h2><p className="story-label">SAME CURIOSITY. DIFFERENT ANGLE.</p></div><div className="portals">{resumes.map((r,i)=><a key={r.id} className="resume-portal" href={r.href} download={r.download} aria-label={`Download ${r.label} résumé`}><div className="portal-entry"><span className="portal-index">0{i+1}</span><div>{r.lines.map(l=><span key={l}>{l}</span>)}</div><small>DOWNLOAD RÉSUMÉ ↗</small></div></a>)}</div>
   </section>
   <section ref={el=>{panels.current[5]=el;}} className="story-scene contact" aria-labelledby="contact-title">
    <div className="contact-copy"><p className="story-label">ACT 08 / WHAT COMES NEXT</p><h2 id="contact-title">Have an<br/>interesting <em>problem?</em></h2><p className="story-quote">Let’s build something<br/>that shouldn’t exist yet.</p><a className="contact-email" href="mailto:balrammaurya2005@gmail.com">balrammaurya2005@gmail.com ↗</a><div className="contact-links"><a href="https://linkedin.com/in/balram-maurya-639026273" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><a href="https://github.com/Balrammmm" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href="https://www.instagram.com/b4lrxm/" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a></div><div className="contact-phone">{phone?<a href="tel:+916284595800">+91 6284595800 ↗</a>:<button onClick={()=>setPhone(true)}>SHOW PHONE +</button>}</div></div><div className="closing-signature"><Signature/></div>
   </section>
   <footer className="story-footer"><div><button onClick={()=>chapter===0?close():chapter===2&&thinkingStep===1?seek(2):seek(chapter-1)} aria-label={chapter===0?`Return to ${returnLabel.toLowerCase()}`:chapter===2&&thinkingStep===1?'Back to Finance':'Previous chapter'}>←</button><span>{chapterNames[chapter]}</span></div><button className="story-return" onClick={close}>← RETURN TO {returnLabel}</button><button className="story-pause" aria-pressed={paused} onClick={()=>{setPaused(!paused);motion.current.paused=!paused;}}>{paused?'RESUME':'PAUSE'} IDLE MOTION</button><button onClick={()=>chapter===5?close():chapter===2&&thinkingStep===0?seekPosition(3.4+2.7*.68):seek(chapter+1)}>{chapter===5?`BACK TO ${returnLabel}`:'CONTINUE'} →</button></footer>
  </div></div>
 </div>;
}

'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Portrait from './Portrait';
import OpeningPortrait from './OpeningPortrait';
import GlobalHeader, {type NavTarget} from './GlobalHeader';
import Signature from './Signature';
import {createPortal} from 'react-dom';
import { categories, createFilmState, type Category } from '@/lib/film-state';
const ProjectJourney=dynamic(()=>import('./ProjectJourney'),{ssr:false});
const Continuation=dynamic(()=>import('./Continuation'),{ssr:false});
const Orbit = dynamic(() => import('./Orbit'), {ssr:false});
gsap.registerPlugin(ScrollTrigger);

export default function Film() {
  const root = useRef<HTMLElement>(null);
  const state = useRef(createFilmState());
  const lenis = useRef<Lenis | null>(null);
  const focusTimeline = useRef<gsap.core.Timeline | null>(null);
  const [project, setProject]=useState<number|null>(null);
  const [story,setStory]=useState<number|null>(null);
  const [storyVisit,setStoryVisit]=useState(0);
  const [selected, setSelected] = useState<Category | null>(null);
  const [ready3d, setReady3d] = useState(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const origin=useRef<{kind:'hero'|'about'|'orbit';scroll:number;focus:HTMLElement|null}>({kind:'orbit',scroll:0,focus:null});
  const shortcut=useRef<gsap.core.Timeline|null>(null),shortcutBusy=useRef(false),curtain=useRef<HTMLDivElement>(null);
  const restoreRef=useRef<()=>void>(()=>{});
  function remember(view:'story'|'project',index:number,kind:'hero'|'about'|'orbit'){
    const focused=document.activeElement as HTMLElement|null;
    origin.current={kind,scroll:window.scrollY,focus:focused?.closest('.resume-control')?.querySelector<HTMLButtonElement>('.resume-trigger')||focused};
    history.pushState({...history.state,portfolio:{view,index,kind}},'',view==='story'?`#act-${String(index+3).padStart(2,'0')}`:'#projects');
  }
  function openShortcut(chapter:number){
    if(shortcutBusy.current)return;
    if(project!==null||story!==null){
      shortcutBusy.current=true;shortcut.current?.kill();
      shortcut.current=gsap.timeline().set(curtain.current,{opacity:1}).fromTo(curtain.current!.querySelector('path'),{strokeDashoffset:1600},{strokeDashoffset:0,duration:state.current.reduced?.1:.8,ease:'power2.inOut'},0).to('.story-journey,.project-journey',{opacity:.2,duration:state.current.reduced?.1:.6},0).call(()=>{history.replaceState({...history.state,portfolio:{view:'story',index:chapter,kind:origin.current.kind}},'',`#act-${chapter+3}`);setProject(null);setStory(chapter);setStoryVisit(v=>v+1);shortcutBusy.current=false;}).to(curtain.current,{opacity:0,duration:.3});
      return;
    }
    shortcutBusy.current=true;remember('story',chapter,activeRef.current===1?'about':activeRef.current===2?'orbit':'hero');lenis.current?.stop();
    const duration=state.current.reduced?.1:.9;
    shortcut.current?.kill();shortcut.current=gsap.timeline().set(curtain.current,{opacity:1})
      .fromTo(curtain.current!.querySelector('path'),{strokeDasharray:1600,strokeDashoffset:1600},{strokeDashoffset:0,duration,ease:'power2.inOut'},0)
      .to(root.current,{opacity:.38,duration},0).call(()=>{setStory(chapter);shortcutBusy.current=false;});
  }
  function globalNavigate(target:NavTarget){
    if(target==='resume'||target==='contact'){openShortcut(target==='resume'?4:5);return;}
    if(shortcutBusy.current)return;
    const index=target==='home'?0:target==='about'?1:2;
    if(project===null&&story===null){navigate(index);return;}
    shortcutBusy.current=true;shortcut.current?.kill();
    const previous={...history.state};delete previous.portfolio;history.replaceState(previous,'',`#${target}`);
    shortcut.current=gsap.timeline().to('.story-journey,.project-journey',{opacity:0,duration:state.current.reduced?.1:.55}).call(()=>{
      setProject(null);setStory(null);setSelected(null);state.current.selected=-1;state.current.focus=0;state.current.suspended=false;
      gsap.set(root.current,{opacity:1});gsap.set(curtain.current,{opacity:0});shortcutBusy.current=false;navigate(index);
    });
  }
  function restoreOrigin(){
    shortcut.current?.kill();focusTimeline.current?.kill();
    state.current.suspended=false;
    const finish=()=>{
      setProject(null);setStory(null);setSelected(null);state.current.selected=-1;state.current.focus=0;
      gsap.set(root.current,{opacity:1});gsap.set(curtain.current,{opacity:0});shortcutBusy.current=false;
      lenis.current?.scrollTo(origin.current.scroll,{immediate:true,force:true});lenis.current?.start();
      requestAnimationFrame(()=>origin.current.focus?.focus({preventScroll:true}));
    };
    const outgoing=document.querySelectorAll('.story-journey,.project-journey');
    shortcut.current=gsap.timeline();
    if(outgoing.length)shortcut.current.to(outgoing,{opacity:0,duration:state.current.reduced?.1:.45},0);
    shortcut.current.to(root.current,{opacity:1,duration:state.current.reduced?.1:.6},0).to(state.current,{focus:0,duration:state.current.reduced?.1:.6,ease:'power2.inOut'},0).to(curtain.current,{opacity:0,duration:state.current.reduced?.1:.4},0).call(finish);
  }
  restoreRef.current=restoreOrigin;
  function requestReturn(){if(history.state?.portfolio)history.back();else restoreOrigin();}
  useEffect(()=>{
    const pop=()=>{
      const route=history.state?.portfolio;
      if(!route){restoreRef.current();return;}
      shortcut.current?.kill();shortcutBusy.current=false;
      origin.current.kind=route.kind;
      lenis.current?.stop();setProject(route.view==='project'?route.index:null);setStory(route.view==='story'?route.index:null);
    };
    const previousRestoration=history.scrollRestoration;history.scrollRestoration='manual';
    window.addEventListener('popstate',pop);
    return()=>{window.removeEventListener('popstate',pop);history.scrollRestoration=previousRestoration;shortcut.current?.kill();};
  },[]);

  useEffect(() => {
    const el = root.current!;
    const media = gsap.matchMedia();
    const prepareOrbit=()=>setReady3d(true);
    window.addEventListener('scroll',prepareOrbit,{once:true,passive:true});
    if(window.scrollY>0)prepareOrbit();
    media.add({reduce:'(prefers-reduced-motion: reduce)', mobile:'(max-width: 700px)', desktop:'(min-width: 701px)'}, context => {
      const reduced = !!context.conditions?.reduce;
      const mobile = !!context.conditions?.mobile;
      state.current.reduced = reduced;
      el.classList.toggle('reduced', reduced);
      const smooth = new Lenis({lerp:.085, smoothWheel:!reduced, syncTouch:false});
      lenis.current = smooth;
      smooth.on('scroll', ScrollTrigger.update);
      const tick = (time:number) => smooth.raf(time * 1000);
      gsap.ticker.add(tick);
      const scenes = Array.from(el.querySelectorAll<HTMLElement>('.scene'));
      const updateAccessibility = (index:number) => {
        if(activeRef.current !== index) {activeRef.current = index; setActive(index);}
        if (!reduced) scenes.forEach((scene,i) => {scene.inert = i !== index; scene.setAttribute('aria-hidden',String(i !== index));});
      };
      if(reduced) {
        scenes.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');});
        state.current.reveal=1;
        scenes.forEach((scene,index)=>ScrollTrigger.create({trigger:scene,start:'top 55%',end:'bottom 55%',onEnter:()=>updateAccessibility(index),onEnterBack:()=>updateAccessibility(index)}));
      } else {
        state.current.reveal=0;
        state.current.orbit=0;
        gsap.set('.about-scene',{autoAlpha:0,clipPath:'inset(0 100% 0 0)'});
        gsap.set('.mind-scene',{autoAlpha:0});
        gsap.set('.thread',{autoAlpha:0,scaleX:.05,transformOrigin:'50% 50%'});
        gsap.set('.thread-path',{strokeDasharray:1600,strokeDashoffset:1600});
        gsap.set('.about-copy > *',{opacity:0});
        gsap.set('.orbit-seed',{autoAlpha:0,scale:.3});
        const timeline = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'film',trigger:el,start:'top top',end:'bottom bottom',scrub:mobile?.5:.75,invalidateOnRefresh:true,onUpdate:self=>{
          state.current.progress=self.progress;
          const next=self.progress<.30?0:self.progress<.67?1:2;
          updateAccessibility(next);
        }}});
        timeline.to({}, {duration:8},0)
          .to('.hero-world',{rotationX:mobile?12:28,scale:.9,z:-120,duration:12,ease:'power1.inOut'},8)
          .to('.hero-background',{opacity:0,duration:10},8)
          .to('.hero-portrait-layer',{opacity:0,duration:4.5,ease:'power1.inOut'},18)
          .to('.hero-details,.hero-message',{opacity:0,y:16,duration:8},10)
          .to('.hero-portrait-layer',{z:35,duration:10},8)
          .to('.hero-world',{scaleY:1,scaleX:.9,rotationX:89.9,duration:9,ease:'power2.inOut'},18)
          .to('.thread',{autoAlpha:1,scaleX:.82,duration:4},23)
          .to('.thread-path',{strokeDashoffset:0,duration:4},23)
          .to('.hero-scene',{autoAlpha:0,duration:2},27)
          .to('.about-scene',{autoAlpha:1,duration:.01},27)
          .fromTo('.about-scene',{clipPath:'inset(50% 0 50% 0)'},{clipPath:'inset(0% 0 0% 0)',duration:12,ease:'power1.inOut'},27)
          .to('.thread',{yPercent:416.67,scaleX:1,rotation:0,duration:12,ease:'power1.inOut'},27)
          .to('.about-copy > *',{opacity:1,duration:5,stagger:1},31)
          .to('.thread',{autoAlpha:0,duration:4},37)
          .fromTo('.about-portrait-layer',{rotationY:-5,xPercent:1,z:0},{rotationY:3,xPercent:-1,z:0,duration:20},34)
          .to('.warm-light',{xPercent:15,opacity:.13,duration:15},38)
          .to('.about-content',{rotationY:mobile?4:8,scale:.97,duration:9},53)
          .to('.orbit-seed',{autoAlpha:1,scale:1,rotation:-14,duration:9},54)
          .fromTo('.orbit-seed ellipse',{strokeDasharray:2900,strokeDashoffset:2900},{strokeDashoffset:0,duration:8,stagger:2},54)
          .to('.about-copy,.about-meta,.about-aside,.about-index,.about-signature',{opacity:0,duration:9},59)
          .to('.about-portrait-layer',{filter:'brightness(.2)',scale:.8,xPercent:-14,duration:11},58)
          .to('.mind-scene',{autoAlpha:1,duration:9},63)
          .to('.about-scene',{autoAlpha:0,duration:6},68)
          .to('.orbit-seed',{scale:1.13,autoAlpha:0,duration:7},69)
          .to(state.current,{reveal:1,duration:12,ease:'power1.out'},62)
          .fromTo('.mind-portrait-layer',{scale:1.13,opacity:0},{scale:1,opacity:1,duration:11},63)
          .to(state.current,{orbit:1,duration:26},74)
          .to({}, {duration:1},99);
        updateAccessibility(0);
      }
      const pointer = (event:PointerEvent) => {
        if(reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        state.current.mouseX=(event.clientX/innerWidth-.5)*2;
        state.current.mouseY=(event.clientY/innerHeight-.5)*2;
        gsap.to('.hero-parallax',{x:state.current.mouseX*4,y:state.current.mouseY*2,rotationY:state.current.mouseX*.35,duration:1.2,overwrite:true});
        gsap.to('.about-parallax',{x:state.current.mouseX*3,y:state.current.mouseY*2,duration:1.2,overwrite:true});
      };
      window.addEventListener('pointermove',pointer,{passive:true});
      document.fonts.ready.then(()=>ScrollTrigger.refresh());
      return()=>{window.removeEventListener('pointermove',pointer);gsap.ticker.remove(tick);smooth.destroy();lenis.current=null;};
    },el);
    return()=>{window.removeEventListener('scroll',prepareOrbit);focusTimeline.current?.kill();media.revert();};
  },[]);

  function navigate(index:number) {
    if(selected) closePreview();
    const reduced=state.current.reduced;
    const positions=[0,.43,.84];
    const target=reduced ? document.querySelectorAll<HTMLElement>('.scene')[index].offsetTop : (root.current!.offsetHeight-innerHeight)*positions[index];
    lenis.current?.start();lenis.current?.scrollTo(target,{duration:reduced?0:2.2,force:true});
  }
  function closePreview() {
    const origin=categories[state.current.selected];
    focusTimeline.current?.kill();
    focusTimeline.current=gsap.timeline({onComplete:()=>{state.current.selected=-1;setSelected(null);lenis.current?.start();if(origin&&activeRef.current===2)document.querySelector<HTMLButtonElement>(`button[aria-label="Explore ${origin.toLowerCase()}"]`)?.focus({preventScroll:true});}})
      .to(state.current,{focus:0,duration:state.current.reduced?.2:.65,ease:'power2.inOut'});
  }
  function explore(index:number) {
    if(state.current.selected>=0) return;
    state.current.selected=index;
    setSelected(categories[index]);
    lenis.current?.stop();
    focusTimeline.current?.kill();
    const destinations:Record<number,number>={0:2,1:0,2:3};
    if(index===5||index===6){const chapter=index===5?1:0;remember('story',chapter,'orbit');focusTimeline.current=gsap.timeline().to(state.current,{focus:1,duration:state.current.reduced?.15:.7,ease:'power2.inOut'}).call(()=>setStory(chapter));return;}
    if(index in destinations){
      remember('project',destinations[index],'orbit');
      focusTimeline.current=gsap.timeline()
        .to(state.current,{focus:1,duration:state.current.reduced?.15:.7,ease:'power2.inOut'})
        .call(()=>setProject(destinations[index]));
    }else{
      focusTimeline.current=gsap.timeline({onComplete:()=>{state.current.selected=-1;setSelected(null);lenis.current?.start();}})
        .to(state.current,{focus:1,duration:state.current.reduced?.2:1.9,ease:'power2.inOut'})
        .to({}, {duration:1.5})
        .to(state.current,{focus:0,duration:state.current.reduced?.2:1.7,ease:'power2.inOut'});
    }
  }
  useEffect(()=>{state.current.suspended=project!==null||story!==null;if(root.current)root.current.inert=project!==null||story!==null;},[project,story]);

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape' && project===null && story===null && state.current.selected>=0) closePreview();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[project,story]);

  return <><main ref={root} className="film" aria-label="Balram Maurya — systems, ideas, machines">
    <a href="#about" className="skip-link" onClick={e=>{e.preventDefault();navigate(1);}}>Skip to About</a>
    <div className="film-stage">
      <GlobalHeader active={active===0?'home':active===1?'about':'projects'} onNavigate={globalNavigate}/>
      <section className="scene hero-scene" aria-labelledby="hero-heading" id="hero">
        <div className="hero-world">
          <div className="hero-background"><OpeningPortrait background/></div>
          <div className="hero-title"><h1 id="hero-heading"><span>BALRAM</span><span>MAURYA</span></h1></div>
          <div className="hero-portrait-layer"><div className="hero-parallax"><OpeningPortrait/></div></div>
          <div className="hero-details"><p className="hero-location micro">PATIALA, INDIA<br/>30.3398° N, 76.3869° E</p><p className="hero-left micro rule">ECE @ THAPAR<br/>AI<br/>SYSTEMS<br/>HARDWARE<br/>BUSINESS<br/>WRITING<br/>AND WHAT’S NEXT.</p><p className="hero-right micro rule">SAME CURIOSITY.<br/>DIFFERENT<br/>ANGLES.</p><div className="signature"><Signature/></div><span className="hero-scroll micro">SCROLL TO BEGIN ↓</span><span className="hero-number micro">01 / 08</span></div>
          <div className="hero-message"><h2>I build things that think,<br/>move, and make decisions.</h2><p>AI products. Data. Machines. Ventures.<br/>Occasionally, things that refuse a category.</p></div>
        </div>
      </section>
      <svg className="thread" viewBox="0 0 1600 160" preserveAspectRatio="none" aria-hidden="true"><path className="thread-path" d="M0 80 C360 80 420 40 650 75 S1040 95 1600 80"/></svg>
      <section className="scene about-scene" id="about" aria-labelledby="about-heading">
        <div className="warm-light"/><div className="about-content">
          <div className="about-portrait-layer"><div className="about-parallax"><Portrait kind="about"/></div></div>
          <p className="about-index micro">01. ABOUT</p>
          <div className="about-copy"><h2 id="about-heading">Beyond<br/>one discipline.</h2><div className="about-prose"><p>I study electronics, but curiosity rarely respects departments.</p><p>Software, machines, markets and ideas keep leading me back to the same question:</p><p>What is actually happening beneath the surface — and how can I build it better?</p></div><p className="instinct rule">The medium changes.<br/>The instinct doesn’t.</p></div>
          <aside className="about-aside micro">IDEAS<br/>SYSTEMS<br/>MACHINES<br/>VENTURES<span className="rule">A WORK<br/>IN PROGRESS.</span></aside>
        </div>
        <div className="about-meta"><div><strong>ECE @ THAPAR</strong><span>Electronics &amp; Communication Engineering</span></div><div><strong>PATIALA, INDIA</strong><span>Building from here, for now.</span></div><div><strong>MAY 2027</strong><span>Expected graduation</span></div></div><div className="about-signature"><Signature/></div>
        <div className="scene-footer micro"><button onClick={()=>navigate(2)}>SCROLL<br/>TO EXPLORE <span>│</span></button><span>02 / 08</span></div>
      </section>
      <div className="orbit-seed" aria-hidden="true"><svg viewBox="0 0 1000 600"><ellipse cx="500" cy="300" rx="440" ry="195"/><ellipse cx="500" cy="300" rx="390" ry="235" transform="rotate(19 500 300)"/><ellipse cx="500" cy="300" rx="420" ry="175" transform="rotate(-21 500 300)"/></svg></div>
      <section className="scene mind-scene" id="mind" aria-labelledby="mind-heading">
        <div className="mind-editorial"><h2 id="mind-heading">Inside<br/><em>the head.</em></h2><div className="mind-intro"><p>Different disciplines.<br/>One recurring instinct.</p><span>Follow the orbit.&nbsp; →</span></div></div>
        <div className="mind-portrait-layer"><Portrait kind="mind"/></div>
        {ready3d && <Orbit state={state.current} onExplore={explore}/>}
        <div className="mind-statements" aria-live="polite"/>
        <div className="scene-footer micro"><span>SELECT A DISCIPLINE TO EXPLORE</span><span>02 / 03</span></div>
      </section>
      <div className={`focus-title ${selected?'visible':''}`} aria-live="polite"><span>INSIDE THE HEAD</span><h2>{selected}</h2>{selected&&<button onClick={closePreview} aria-label="Return to Inside the Head">Return to orbit&nbsp; ↙</button>}</div>
    </div>
  </main><div ref={curtain} className="shortcut-curtain" aria-hidden="true"><svg viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="M-50 590 C120 650 245 160 480 280 S785 640 1060 60"/></svg></div>{project!==null && createPortal(<ProjectJourney onNavigate={globalNavigate} initialIndex={project} onReturn={requestReturn} onContinue={()=>{history.replaceState({...history.state,portfolio:{view:'story',index:0,kind:origin.current.kind}},'','#act-03');setProject(null);setStory(0);}}/>,document.body)}{story!==null&&createPortal(<Continuation key={`${story}-${storyVisit}`} onNavigate={globalNavigate} initialChapter={story} returnLabel={origin.current.kind==='hero'?'HERO':origin.current.kind==='about'?'ABOUT':'ORBIT'} onReturn={requestReturn}/>,document.body)}</>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import {resumes} from '@/lib/story';
import '../app/resume.css';
export default function ResumeControl({onPortals}:{onPortals:()=>void}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const pointer=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);trigger.current?.focus();}};document.addEventListener('pointerdown',pointer);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',pointer);document.removeEventListener('keydown',key);};},[open]);
 return <div className="resume-control" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
  <button ref={trigger} className="resume-trigger" aria-expanded={open} aria-controls="resume-selector" onClick={()=>setOpen(!open)}>RÉSUMÉ ↗</button>
  {open&&<div className="resume-selector" id="resume-selector" aria-label="Choose a résumé">{resumes.map(r=><a key={r.id} href={r.href} download={r.download}><span>{r.label}</span><small>DOWNLOAD ↗</small></a>)}<button className="resume-view" onClick={()=>{setOpen(false);onPortals();}}>CHOOSE YOUR LENS — ACT 07 ↗</button></div>}
 </div>;
}

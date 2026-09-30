'use client';
import {useEffect,useRef,useState} from 'react';
import {neoComponents,quadComponents} from '@/lib/hardware';
import type {ProjectMotion} from '@/lib/projects';
export default function HardwareAnnotations({active,motion}:{active:number;motion:ProjectMotion}){
 const parts=active===3?neoComponents:quadComponents,lines=useRef<(SVGPathElement|null)[]>([]),root=useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{let frame=0;const draw=()=>{frame=requestAnimationFrame(draw);if(document.hidden)return;parts.forEach((part,i)=>{const point=motion.anchors?.[part.id],line=lines.current[i];if(!line||!point)return;const y=(.12+part.row*(active===3?.17:.215))*1000,x=part.side?780:220;line.setAttribute('d',`M${point.x*1000} ${point.y*1000} L${part.side?740:260} ${y} L${x} ${y}`);});};frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);motion.highlight=null;};},[active,motion,parts]);
 function highlight(id:string|null){setSelected(id);motion.highlight=id;}
 return <div ref={root} className="hardware-annotations"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">{parts.map((p,i)=><path key={p.id} ref={el=>{lines.current[i]=el;}}/>)}</svg>{parts.map(p=><button key={p.id} aria-pressed={selected===p.id} className="hardware-label" data-side={p.side} style={{top:`${12+p.row*(active===3?17:21.5)}%`}} onPointerEnter={()=>highlight(p.id)} onPointerLeave={()=>highlight(null)} onFocus={()=>highlight(p.id)} onBlur={()=>highlight(null)} onClick={()=>highlight(selected===p.id?null:p.id)}><strong>{p.label}</strong><span>{p.detail}</span></button>)}<p className="hardware-note" aria-live="polite">{parts.find(p=>p.id===selected)?.note||'Explore a component to understand its role.'}</p></div>;
}

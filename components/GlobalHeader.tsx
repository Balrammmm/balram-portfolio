'use client';
export type NavTarget='home'|'about'|'projects'|'resume'|'contact';
const items:[NavTarget,string][]=[['home','HOME'],['about','ABOUT'],['projects','PROJECTS'],['resume','RÉSUMÉ'],['contact','CONTACT']];
export default function GlobalHeader({active,onNavigate}:{active?:NavTarget;onNavigate:(target:NavTarget)=>void}){
 return <header className="global-header"><button className="global-brand" aria-label="Balram Maurya — Home" onClick={()=>onNavigate('home')}>BM</button><nav aria-label="Main navigation">{items.map(([id,label])=><button key={id} aria-current={active===id?'page':undefined} onClick={()=>onNavigate(id)}>{label}</button>)}</nav><span className="global-identity">SYSTEMS / IDEAS / MACHINES / 2026</span></header>;
}

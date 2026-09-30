export type FlowPoint={x:number;y:number};
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const soften=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};

// One reversible handoff: outgoing copy is gone before incoming copy can appear.
export function writingHandoff(position:number){
 const out=soften((position-3.12)/.28),incoming=soften((position-3.4)/.18);
 return {out,incoming,bridge:soften((position-3.05)/.50),transfer:soften((position-3.55)/.17)};
}
export function thinkingHandoff(position:number){
 const p=clamp((position-3.4)/2.7),morph=soften((p-.44)/.16);
 return {p,morph,finance:1-soften((p-.44)/.06),philosophy:soften((p-.50)/.10)};
}
export function orbitPoint(t:number,width:number,height:number,phase=0):FlowPoint{
 // Same source-image frame as the statue; a broad tilted ellipse around its torso.
 const a=Math.PI+t*Math.PI*2,tilt=-.12+Math.sin(phase)*.018;
 const x=Math.cos(a)*width*.42,y=Math.sin(a)*height*.205;
 return {x:width*.515+x*Math.cos(tilt)-y*Math.sin(tilt),y:height*.52+x*Math.sin(tilt)+y*Math.cos(tilt)};
}
const cubic=(a:number,b:number,c:number,d:number,t:number)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
export function bridgePath(target:FlowPoint[],progress:number){
 // Freeze the existing journey curve at the book-closing cue, then bring it
 // onto the exact projected finance curve. No second page-edge decoration.
 const local=(3.05-1.6)/(3.4-1.6),mix=soften(local),x=650+(560-650)*mix,b=15+(90-15)*mix;
 const first=[{x:-80,y:840},{x:x-420,y:760-b},{x:x-380,y:240},{x:x-40,y:390}];
 const second=[first[3],{x:x+300,y:540},{x:x+250,y:730+b},{x:1080,y:80}];
 return target.map((end,i)=>{
  const t=i/(target.length-1),s=t<.5?first:second,u=t<.5?t*2:(t-.5)*2;
  const sx=cubic(s[0].x,s[1].x,s[2].x,s[3].x,u),sy=cubic(s[0].y,s[1].y,s[2].y,s[3].y,u);
  return `${i?'L':'M'}${(sx+(end.x-sx)*progress).toFixed(2)} ${(sy+(end.y-sy)*progress).toFixed(2)}`;
 }).join(' ');
}

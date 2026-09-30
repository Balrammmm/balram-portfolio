import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('lib/story-flow.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {writingHandoff,thinkingHandoff,orbitPoint,bridgePath}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const snapshots=new Map();
let samples=0;
// Repeated forward/reverse scrubbing uses the same state, with no accumulated fades.
for(let repeat=0;repeat<20;repeat++)for(const direction of [1,-1])for(let step=0;step<=3200;step++){
 const tick=direction===1?step:3200-step,p=2.95+tick*.001;
 const w=writingHandoff(p),t=thinkingHandoff(p);
 assert((1-w.out)*w.incoming<1e-10,'Writing and Finance must never share a text slot');
 assert(t.finance*t.philosophy<1e-10,'Finance and Philosophy copy must not overlap');
 if(w.transfer>0)assert(Math.abs(w.bridge-1)<1e-10,'Paths must align before ownership transfers');
 if(p>=3.72)assert.equal(w.transfer,1,'The previous scene signal must be fully retired');
 const key=tick,result=JSON.stringify([w,t]);
 if(snapshots.has(key))assert.equal(result,snapshots.get(key),'Reverse/repeat may not restart or accumulate state');
 else snapshots.set(key,result);
 samples++;
}
assert.equal(writingHandoff(3.72).incoming,1,'Continue destination must finish its reveal');
assert.equal(thinkingHandoff(3.4+2.7*.68).philosophy,1,'Continue must reach Philosophy');
const viewports=[];
for(const [w,h] of [[1920,1080],[1440,900],[1366,768],[390,844]]){
 const mobile=w<=700,margin=Math.max(24,Math.min(80,w*.04));
 const stageWidth=mobile?w-32:w*.56-margin,stageHeight=h*(mobile?.39:.67);
 const frameWidth=Math.min(stageWidth,h*(mobile?.42:.72)),frameHeight=frameWidth/1.125;
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(let phase=0;phase<=4;phase++)for(let i=0;i<=120;i++){
  const point=orbitPoint(i/120,frameWidth,frameHeight,phase/4*2*Math.PI);
  const x=(stageWidth-frameWidth)/2+point.x,y=stageHeight-frameHeight+point.y;
  assert(x>4&&x<stageWidth-4&&y>4&&y<stageHeight-4,'Orbit must stay inside its responsive stage');
  minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
 }
 const start=orbitPoint(0,frameWidth,frameHeight),end=orbitPoint(1,frameWidth,frameHeight);
 assert(Math.hypot(start.x-end.x,start.y-end.y)<1e-8,'Front/back arc seam must close');
 const loop=orbitPoint(.31,frameWidth,frameHeight,Math.PI*2),initial=orbitPoint(.31,frameWidth,frameHeight,0);
 assert(Math.hypot(loop.x-initial.x,loop.y-initial.y)<1e-8,'22-second loop must not jump');
 viewports.push({viewport:`${w}x${h}`,orbitBounds:[minX,minY,maxX,maxY].map(Math.round),pass:true});
}
const target=Array.from({length:121},(_,i)=>({x:560+i*2,y:610-i*.6}));
const bridgeStart=bridgePath(target,0),bridgeEnd=bridgePath(target,1);
const coordinates=s=>s.match(/-?\d+(?:\.\d+)?/g).map(Number);
const endPoints=coordinates(bridgeEnd);
target.forEach((point,i)=>{assert(Math.abs(point.x-endPoints[i*2])<.011);assert(Math.abs(point.y-endPoints[i*2+1])<.011);});
assert(bridgeStart.startsWith('M-80.00 840.00'));
const source=fs.readFileSync('components/Continuation.tsx','utf8'),css=fs.readFileSync('app/polish.css','utf8');
assert(!source.includes('writing-edge'),'Duplicate Writing decoration must be removed');
assert(!source.includes('key={thinkingStep}'),'Copy must not remount/restart on boundary crossings');
assert(!css.includes('animation:story-in'),'No second CSS animation may fight the scroll clock');
const report={kind:'Timeline, path and responsive geometry checks — not browser interaction or FPS tests',samples,repetitions:20,checks:['No overlapping copy','Reverse/repeated seek determinism','Completed Continue reveals','No old Writing path','Continuous arc seam and 22-second loop','Exact bridge destination'],viewports};
fs.mkdirSync('work/flow-qa',{recursive:true});fs.writeFileSync('work/flow-qa/checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

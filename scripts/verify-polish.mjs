import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as T from 'three';
let code=ts.transpileModule(fs.readFileSync('lib/thinking-models.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
code=code.replaceAll("'three'",JSON.stringify(pathToFileURL(path.resolve('node_modules/three/build/three.module.js')).href)).replaceAll("'three/examples/jsm/geometries/RoundedBoxGeometry.js'",JSON.stringify(pathToFileURL(path.resolve('node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js')).href));
const {thinkingModels}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const models=thinkingModels(),rows=[];
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[390,844]]){
 const margin=Math.max(24,Math.min(80,width*.04)),w=width<=700?width-32:width*.56-margin,h=height*(width<=700?.39:.67);
 const world=new T.Group(),camera=new T.PerspectiveCamera(35,w/h,.1,50);world.scale.setScalar(Math.min(1,w/h*.95));
 camera.position.set(.8,2.3,8.2);camera.lookAt(0,.55,0);camera.updateMatrixWorld();world.add(models.market,models.path);world.updateMatrixWorld(true);
 let extent=0,vertices=0;
 world.traverse(o=>{if(!(o instanceof T.Mesh||o instanceof T.Line))return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).project(camera);assert(Number.isFinite(v.x)&&Number.isFinite(v.y));extent=Math.max(extent,Math.abs(v.x),Math.abs(v.y));vertices++;}});
 const statueWidth=Math.min(w,height*(width<=700?.42:.72)),statueHeight=statueWidth/1.125;
 rows.push({viewport:`${width}x${height}`,stage:'finance + image bounds',extent:+extent.toFixed(3),vertices,statueFits:statueHeight<=h,pass:extent<1});assert(extent<1);assert(statueHeight<=h);
}
const film=fs.readFileSync('components/Film.tsx','utf8'),continuation=fs.readFileSync('components/Continuation.tsx','utf8');
assert(film.includes('index===5||index===6'),'Actual visible orbit IDs must navigate into ACTs');
assert(film.includes("openShortcut(target==='resume'?4:5)"),'Direct shortcuts must map to ACT07/08');
const header=fs.readFileSync('components/GlobalHeader.tsx','utf8');assert(header.includes("['home','HOME'],['about','ABOUT'],['projects','PROJECTS'],['resume','RÉSUMÉ'],['contact','CONTACT']"));
assert(!film.includes('hero-utilities')&&!film.includes('motion-toggle'));
assert(!/CHESS|knight|chessboard/i.test(continuation+fs.readFileSync('lib/thinking-models.ts','utf8')));
assert.equal(models.candles.length,10);
assert(fs.readFileSync('public/story/philosopher-source.png').equals(fs.readFileSync('C:/Users/OMEN/Downloads/download (1).png')));
assert(continuation.includes('2024–2026')&&!continuation.includes('2025–26'));
assert(continuation.includes('gsap.fromTo(value,{position:0}'),'ACT mapping must remain absolute for direct entry');
assert.equal((film.match(/<Signature\/>/g)||[]).length,2);assert(continuation.includes('<Signature/>'));
for(const file of ['business','hardware'])assert(fs.readFileSync(`public/resume/${file}.pdf`).subarray(0,4).toString()==='%PDF');
console.log(JSON.stringify({kind:'CPU geometry and source contracts; not browser QA',rows},null,2));


// CPU-only geometry check. This does not replace browser screenshots.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import * as T from 'three';
const three=pathToFileURL(path.resolve('node_modules/three/build/three.module.js')).href;
function moduleURL(file,replacements={}){
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const [from,to] of Object.entries({'three':three,...replacements}))code=code.replaceAll(`'${from}'`,JSON.stringify(to));
 return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const neo=moduleURL('lib/neo-model.ts');
const {projectModels}=await import(moduleURL('lib/project-models.ts',{'./neo-model':neo}));
const {neoComponents,quadComponents}=await import(moduleURL('lib/hardware.ts'));
const models=projectModels(),results=[];
const ease=v=>{const n=T.MathUtils.clamp(v,0,1);return n*n*(3-2*n);};
for(const [width,height] of [[1920,1080],[1536,864],[1440,900],[1366,768],[390,844]]){
 const w=width<=700?width-40:width*.53,h=height*(width<=700?.36:.7);
 const camera=new T.PerspectiveCamera(36,w/h,.1,60);camera.position.z=10;camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const wh=2*Math.tan(Math.PI/10)*10,ww=wh*w/h;
 for(const index of [3,4]){
  const model=models[index],parts=index===3?neoComponents:quadComponents;
  for(const p of [.5,.7,.9,1]){
   model.scale.setScalar(Math.min(ww/(index===4?4.6:4),wh/(index===4?6.5+2*ease((p-.40)/.35):6.4)));
   for(const part of model.children){const {home,explode,stage=0}=part.userData;if(home&&explode)part.position.copy(home).addScaledVector(explode,index===3?ease((p-.5-stage*.065)/.19):ease((p-.40)/.35));}
   model.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(model),points=[];
   for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new T.Vector3(x,y,z).project(camera));
   const max=Math.max(...points.flatMap(v=>[Math.abs(v.x),Math.abs(v.y)]));
   const names=parts.every(p=>model.children.some(c=>c.name===p.id&&c.userData.anchor));
   results.push({viewport:`${width}x${height}`,model:index===3?'NEO':'Quadcopter',progress:p,projectedExtent:+max.toFixed(3),partsPresent:names,pass:max<=1&&names});
  }
 }
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>!r.pass))process.exitCode=1;

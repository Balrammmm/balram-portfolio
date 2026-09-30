import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
// Illustrative financial geometry. No prices, returns or live-market claims.
export function thinkingModels(){
 const gold=new T.MeshStandardMaterial({color:0xb9a17c,metalness:.72,roughness:.35,transparent:true});
 const graphite=new T.MeshStandardMaterial({color:0x50534e,metalness:.4,roughness:.55,transparent:true});
 const market=new T.Group(),candles:T.Group[]=[];
 for(let i=0;i<10;i++){
  const g=new T.Group(),height=.36+(.5+.5*Math.sin(i*.87))*.68,base=.12+i*.055;
  g.position.set((i-4.5)*.39,0,(i%3-1)*.38);market.add(g);candles.push(g);
  const body=new T.Mesh(new RoundedBoxGeometry(.14,height,.14,2,.014),i%3?gold:graphite);body.position.y=base+height/2;g.add(body);
  const wick=new T.Mesh(new T.CylinderGeometry(.008,.008,height+.3,8),gold);wick.position.y=base+height/2;g.add(wick);
 }
 const gridMat=new T.LineBasicMaterial({color:0x88795e,transparent:true,opacity:.2});
 for(let i=0;i<4;i++){
  market.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-2.25,0,-1+i*.67),new T.Vector3(2.25,0,-1+i*.67)]),gridMat));
  market.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-2.1+i*1.4,0,-1),new T.Vector3(-2.1+i*1.4,0,1)]),gridMat));
 }
 const chart=new T.CatmullRomCurve3([new T.Vector3(-2,.24,.48),new T.Vector3(-1.2,.48,.25),new T.Vector3(-.45,.4,.05),new T.Vector3(.35,1.05,-.18),new T.Vector3(1.15,.91,-.3),new T.Vector3(2,1.42,-.45)]).getPoints(120);
 const path=new T.Line(new T.BufferGeometry().setFromPoints(chart),new T.LineBasicMaterial({color:0xc9ad7d,transparent:true,opacity:.6}));
 return {market,candles,path,chart,materials:[gold,graphite,gridMat]};
}

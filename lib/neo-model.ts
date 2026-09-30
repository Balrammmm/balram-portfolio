import * as T from 'three';
export function neoModel(){
 const root=new T.Group();root.rotation.set(.12,-.28,0);
 const matte=new T.MeshStandardMaterial({color:0x111313,roughness:.66,metalness:.28});
 const board=new T.MeshStandardMaterial({color:0x795c38,roughness:.9});
 const pcb=new T.MeshStandardMaterial({color:0x233f34,roughness:.58,metalness:.2});
 const metal=new T.MeshStandardMaterial({color:0x8b8c85,roughness:.35,metalness:.8});
 const brass=new T.MeshStandardMaterial({color:0xb39a64,roughness:.3,metalness:.8});
 const glow=new T.MeshStandardMaterial({color:0xbfe8ef,emissive:0x6bc1e0,emissiveIntensity:.55});
 function mesh(g:T.Group,geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
 const box=(g:T.Group,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=matte)=>mesh(g,new T.BoxGeometry(w,h,d),mat,x,y,z);
 function part(id:string,offset:number[],stage:number,anchor:number[]){const g=new T.Group();g.name=id;g.userData={home:new T.Vector3(),explode:new T.Vector3(...offset),stage,anchor:new T.Vector3(...anchor)};root.add(g);return g;}
 const display=part('display',[-.12,1.75,0],0,[0,.56,.88]);
 box(display,0,.55,.86,.86,.5,.055,pcb);box(display,0,.55,.9,.73,.36,.025);for(const x of [-.17,.17]){box(display,x,.55,.923,.14,.16,.015,glow);box(display,x,.55,.934,.065,.075,.01);}
 for(const x of [-.36,.36])for(const y of [.36,.74])mesh(display,new T.CylinderGeometry(.027,.027,.02,10),brass,x,y,.91).rotation.x=Math.PI/2;
 const mic=part('microphone',[.48,1.78,-.08],0,[.18,.2,.4]);box(mic,.18,.2,.4,.19,.05,.25,pcb);mesh(mic,new T.CylinderGeometry(.045,.045,.03,16),metal,.18,.24,.4);
 const esp=part('controller',[-.2,1.15,-.1],1,[0,-.18,0]);box(esp,0,-.18,0,.54,.06,.85,pcb);box(esp,0,-.12,.1,.28,.035,.33,metal);
 const driver=part('driver',[.48,.7,-.12],1,[.35,-.33,-.28]);box(driver,.35,-.33,-.28,.4,.07,.4,pcb);box(driver,.35,-.25,-.28,.25,.12,.2);
 const audio=part('audio',[-.5,.25,.12],2,[-.32,-.2,.4]);box(audio,-.32,-.2,.4,.25,.06,.27,pcb);box(audio,-.32,-.15,.4,.11,.025,.11);
 const speaker=part('speaker',[.54,.15,.48],2,[0,-.36,.94]);mesh(speaker,new T.CylinderGeometry(.39,.39,.1,40),matte,0,-.36,.93).rotation.x=Math.PI/2;mesh(speaker,new T.CylinderGeometry(.30,.35,.08,40),metal,0,-.36,1).rotation.x=Math.PI/2;
 const power=part('power',[-1,-.5,1.15],2,[-.22,-.4,-.3]);box(power,-.22,-.4,-.3,.5,.25,.8,new T.MeshStandardMaterial({color:0x516147,roughness:.7}));box(power,-.22,-.22,-.45,.28,.055,.24,pcb);
 const motors=part('motors',[.3,-.3,.18],3,[.72,-.7,.57]);
 const chassis=part('chassis',[0,-.85,0],3,[0,-.67,.6]);box(chassis,0,-.68,0,1.6,.12,1.8,board);box(chassis,0,.04,.8,1.36,1.55,.055,board);
 for(const x of [-.92,.92])for(const z of [-.56,.56]){
  const drive=mesh(motors,new T.CylinderGeometry(.12,.12,.31,16),metal,x*.75,-.68,z);drive.rotation.z=Math.PI/2;
  const wheel=new T.Group();wheel.position.set(x,-.68,z);chassis.add(wheel);mesh(wheel,new T.CylinderGeometry(.34,.34,.26,28),matte).rotation.z=Math.PI/2;mesh(wheel,new T.CylinderGeometry(.21,.21,.28,20),metal).rotation.z=Math.PI/2;
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;box(wheel,0,Math.sin(a)*.34,Math.cos(a)*.34,.29,.07,.06).rotation.x=-a;}
 }
 for(const g of [esp,audio,driver]){const base=g.children[0].position;for(let n=0;n<8;n++)for(const side of [-1,1])box(g,base.x+side*.25,base.y+.04,base.z+(n-3.5)*.065,.07,.02,.018,brass);}
 for(let i=0;i<12;i++){const x=-.45+i*.08;const c=new T.CatmullRomCurve3([new T.Vector3(x,-.2,-.4),new T.Vector3(x*.65,.18+(i%3)*.1,.1),new T.Vector3(x,.05,.62)]);mesh(esp,new T.TubeGeometry(c,14,.011,5,false),new T.MeshStandardMaterial({color:[0x9e7334,0x80372c,0x224d50,0x34402b][i%4],roughness:.7}));}
 return root;
}

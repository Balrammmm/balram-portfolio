import * as T from 'three';
import {neoModel} from './neo-model';
export function projectModels(){
 const black=new T.MeshStandardMaterial({color:0x080909,metalness:.12,roughness:.82,envMapIntensity:.12});
 const gold=new T.MeshStandardMaterial({color:0x9f7f4e,metalness:.85,roughness:.28});
 const board=new T.MeshStandardMaterial({color:0x73522d,metalness:0,roughness:.95});
 const pcb=new T.MeshStandardMaterial({color:0x26352c,metalness:.25,roughness:.6});
 const silver=new T.MeshStandardMaterial({color:0x94938c,metalness:.85,roughness:.35});
 const models=Array.from({length:5},()=>new T.Group());
 function add(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
 function box(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material=black){return add(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
 function part(p:T.Object3D,offset:T.Vector3){const group=new T.Group();group.userData.explode=offset;p.add(group);return group;}
 function edge(p:T.Object3D,g:T.BufferGeometry){p.add(new T.LineSegments(new T.EdgesGeometry(g),new T.LineBasicMaterial({color:0xb49b73,transparent:true,opacity:.65})));}
 // Separate triangular shell pieces expose a warm interior as the investigation opens.
 const sphere=new T.IcosahedronGeometry(1.32,3);const a=sphere.attributes.position;
 for(let i=0;i<a.count;i+=3){const points=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,i+j));const centre=points.reduce((sum,p)=>sum.add(p),new T.Vector3()).multiplyScalar(1/3);const shell=new T.BufferGeometry().setFromPoints(points.map(p=>p.sub(centre).multiplyScalar(.995)));shell.setIndex([0,1,2]);shell.computeVertexNormals();const m=add(models[0],shell,black.clone(),centre.x*(1.005+Math.sin(i*4.3)*.008),centre.y*(1.005+Math.sin(i*4.3)*.008),centre.z*(1.005+Math.sin(i*4.3)*.008));m.userData.home=m.position.clone();m.userData.explode=centre.clone().normalize().multiplyScalar(.9+(i%7)*.04);(m.material as T.MeshStandardMaterial).side=T.DoubleSide;}
 sphere.dispose();add(models[0],new T.IcosahedronGeometry(.99,2),new T.MeshStandardMaterial({color:0xc99a52,emissive:0x9b5d24,emissiveIntensity:.3,metalness:.6,roughness:.4}));
 // ProductPulse and RetailPulse use crisp HTML/SVG diagrams.
 const quad=models[4];const quadParts=Array.from({length:8},(_,i)=>part(quad,new T.Vector3(0,[2.05,1.42,.9,-.75,.36,-.05,-1.6,-.38][i],0)));
 box(quadParts[3],0,0,0,.9,.1,.9,black);box(quadParts[4],0,.27,0,.54,.05,.65,pcb);box(quadParts[4],0,.31,0,.24,.025,.3,silver);box(quadParts[5],.05,.13,.1,.3,.04,.3,pcb);box(quadParts[6],0,-.29,0,.65,.35,.85,silver);
 for(const x of [-1.18,1.18])for(const z of [-1.18,1.18]){const arm=box(quadParts[3],x/2,0,z/2,1.75,.11,.16,black);arm.rotation.y=-Math.atan2(z,x);box(quadParts[2],x*.65,.06,z*.65,.36,.065,.17,pcb);add(quadParts[1],new T.CylinderGeometry(.19,.2,.29,24),black,x,.19,z);add(quadParts[1],new T.TorusGeometry(.17,.03,8,32),gold,x,.2,z).rotation.x=Math.PI/2;const rotor=box(quadParts[0],x,.43,z,1.1,.025,.11,black);rotor.rotation.y=x*z*.5;add(quadParts[0],new T.CylinderGeometry(.055,.055,.09,16),gold,x,.43,z);}
 // Machined motor ribs, circuit traces, fasteners and shaped propeller blades.
 const copper=new T.MeshStandardMaterial({color:0x985c31,metalness:.85,roughness:.4});
 for(const x of [-1.18,1.18])for(const z of [-1.18,1.18]){
  for(let n=0;n<12;n++){const a=n/12*Math.PI*2;const rib=box(quadParts[1],x+Math.cos(a)*.196,.19,z+Math.sin(a)*.196,.02,.19,.045,black);rib.rotation.y=-a;}
  add(quadParts[1],new T.CylinderGeometry(.135,.135,.13,24),copper,x,.17,z);
  for(let n=0;n<6;n++){const a=n/6*Math.PI*2;add(quadParts[1],new T.CylinderGeometry(.018,.018,.015,8),silver,x+Math.cos(a)*.135,.342,z+Math.sin(a)*.135);}
  const blades=new T.Group();blades.position.set(x,.445,z);blades.rotation.y=x*z*.5;quadParts[0].add(blades);
  for(const angle of [0,Math.PI]){const shape=new T.Shape();shape.moveTo(0,-.04);shape.bezierCurveTo(.2,-.12,.49,-.16,.61,-.06);shape.bezierCurveTo(.65,.04,.29,.1,0,.04);shape.closePath();const blade=add(blades,new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.008,bevelThickness:.004}),black);blade.rotation.set(Math.PI/2,0,angle);}
  const cable=new T.CatmullRomCurve3([new T.Vector3(x,.08,z),new T.Vector3(x*.65,.13,z*.65),new T.Vector3(x*.2,.1,z*.2)]);add(quadParts[3],new T.TubeGeometry(cable,12,.014,5,false),copper);
 }
 for(const g of [quadParts[4],quadParts[5]]){
  const base=g.children.find(o=>o instanceof T.Mesh) as T.Mesh;const center=base.position;
  for(let n=0;n<12;n++)for(const sign of [-1,1]){box(g,center.x+sign*.26,center.y+.04,center.z+(n-5.5)*.04,.08,.018,.013,gold);}
  for(let n=0;n<6;n++){box(g,center.x+(n%3-1)*.1,center.y+.042,center.z+(Math.floor(n/3)-.5)*.3,.065,.03,.043,black);}
 }
 for(const x of [-.34,.34])for(const z of [-.34,.34]){add(quadParts[3],new T.CylinderGeometry(.03,.03,.018,8),silver,x,.065,z);}
 box(quadParts[6],0,-.1,0,.1,.028,.86,black);box(quadParts[6],0,-.48,0,.1,.025,.86,black);
 box(quadParts[7],-.22,-.1,-.15,.3,.05,.35,pcb);box(quadParts[7],-.22,-.05,-.15,.15,.06,.16,black);
 const ids=['propellers','motors','esc','frame','controller','imu','battery','regulator'];
 quadParts.forEach((g,i)=>{g.name=ids[i];g.userData.anchor=g.children[0].position.clone();g.userData.stage=i;});
 quad.rotation.set(.29,-.35,0);
 models.forEach(model=>model.traverse(obj=>{if(obj instanceof T.Group&&obj.userData.explode&&!obj.userData.home)obj.userData.home=obj.position.clone();}));
 models[3]=neoModel();
 return models;
}

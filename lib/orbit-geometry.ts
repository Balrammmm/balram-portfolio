import * as T from 'three';

export function buildObjects() {
  const gold = new T.MeshStandardMaterial({color:0xb69a69,metalness:.86,roughness:.3});
  const dark = new T.MeshStandardMaterial({color:0x10110f,metalness:.82,roughness:.4,flatShading:true,envMapIntensity:.65});
  const silver = new T.MeshStandardMaterial({color:0x8f918b,metalness:.9,roughness:.24});
  const paper = new T.MeshStandardMaterial({color:0xd8c8a4,metalness:.05,roughness:.85,side:T.DoubleSide});
  const leather = new T.MeshStandardMaterial({color:0x31291d,roughness:.8});
  function mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,x=0,y=0,z=0) {const o=new T.Mesh(g,m.clone());o.position.set(x,y,z);parent.add(o);return o;}
  function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material=gold) {return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);}
  function edge(g:T.BufferGeometry,parent:T.Object3D,color=0xc9ae7d) {const lines=new T.LineSegments(new T.EdgesGeometry(g),new T.LineBasicMaterial({color,transparent:true,opacity:.85}));parent.add(lines);return lines;}
  const surface=document.createElement('canvas');surface.width=256;surface.height=256;
  const surfaceContext=surface.getContext('2d')!;const pixels=surfaceContext.createImageData(256,256);
  let seed=12345;
  for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=65+(seed%140);pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=255;}
  surfaceContext.putImageData(pixels,0,0);const stoneTexture=new T.CanvasTexture(surface);stoneTexture.wrapS=stoneTexture.wrapT=T.RepeatWrapping;stoneTexture.repeat.set(3,3);
  function rock(radius:number,detail:number,parent:T.Object3D) {
    const g=new T.IcosahedronGeometry(radius,detail);
    const pos=g.attributes.position;
    for(let i=0;i<pos.count;i++) {const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const variation=1+.15*Math.sin(x*24+y*19+z*31)+.07*Math.cos(y*43-x*13);pos.setXYZ(i,x*variation,y*variation,z*variation);}
    g.computeVertexNormals();const rocky=dark.clone();rocky.bumpMap=stoneTexture;rocky.bumpScale=.055;mesh(g,rocky,parent);rocky.dispose();return g;
  }
  const systems=new T.Group();rock(.55,5,systems);
  for(let i=0;i<2;i++){const ring=mesh(new T.TorusGeometry(.62,.007,5,80),gold,systems);ring.rotation.set(.65+i*.8,.2+i*.7,.3);}
  const ventures=new T.Group();mesh(new T.IcosahedronGeometry(.46,0),dark,ventures);const cube=new T.BoxGeometry(.92,.92,.92);edge(cube,ventures);const inner=edge(new T.BoxGeometry(.86,.86,.86),ventures,0x756346);inner.rotation.y=.08;ventures.rotation.set(.3,.2,.55);
  const hardware=new T.Group();rock(.56,3,hardware);box(hardware,0,0,.4,.66,.66,.07,dark);box(hardware,0,0,.45,.4,.4,.025,silver);box(hardware,0,0,.47,.35,.35,.025,dark);
  for(let side=0;side<4;side++)for(let n=0;n<9;n++) {const pin=new T.Group();pin.rotation.z=side*Math.PI/2;hardware.add(pin);box(pin,(n-4)*.067,.31,.45,.021,.16,.024);box(pin,(n-4)*.067,.41,.38,.021,.05,.14);}
  for(let n=0;n<8;n++){box(hardware,-.22+n*.06,-.04,.489,.025,.004,.004,silver);}
  hardware.rotation.set(.18,-.22,-.22);
  const ai=new T.Group();edge(new T.BoxGeometry(.73,.73,.73),ai,0xd8cfb5);const aiInner=edge(new T.IcosahedronGeometry(.35,0),ai);aiInner.rotation.y=.5;mesh(new T.SphereGeometry(.105,20,12),gold,ai);ai.rotation.set(.3,.4,.25);
  for(let i=0;i<4;i++){box(ai,(i%2?1:-1)*.27,(i<2?1:-1)*.27,0,.02,.02,.65,silver);}
  const finance=new T.Group();for(let i=0;i<5;i++){const y=-.3+i*.16;const h=[.32,.42,.3,.5,.39][i];box(finance,(i-2)*.19,y,0,.105,h,.105,i%2?gold:silver);box(finance,(i-2)*.19,y+.015,0,.013,h+.25,.013,i%2?gold:silver);}finance.rotation.y=-.18;
  const writing=new T.Group();
  function sheet(side:number,lift:number) {
    const rows=24,cols=10,verts:number[]=[],uvs:number[]=[],indices:number[]=[];
    for(let y=0;y<=cols;y++)for(let x=0;x<=rows;x++){const u=x/rows;verts.push(side*u*.65,(y/cols-.5)*.85,Math.sin(u*Math.PI)*.16+u*.3+lift);uvs.push(side>0?u:1-u,y/cols);if(x<rows&&y<cols){const a=y*(rows+1)+x,b=a+rows+1;indices.push(a,b,a+1,b,b+1,a+1);}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  const pageCanvas=document.createElement('canvas');pageCanvas.width=512;pageCanvas.height=512;const context=pageCanvas.getContext('2d')!;context.fillStyle='#d9caac';context.fillRect(0,0,512,512);context.fillStyle='#625643';
  for(let row=0;row<30;row++){for(let word=0;word<7;word++){const length=22+((row*17+word*11)%23);context.fillRect(48+word*59,42+row*14,length,2);}}
  const pageTexture=new T.CanvasTexture(pageCanvas);pageTexture.colorSpace=T.SRGBColorSpace;
  for(const side of [-1,1]) {mesh(sheet(side,-.042),leather,writing);for(let i=0;i<5;i++)mesh(sheet(side,-.032+i*.007),paper,writing);const material=paper.clone();material.map=pageTexture;mesh(sheet(side,.006),material,writing);}
  box(writing,0,0,-.035,.025,.87,.035,leather);writing.rotation.set(-.55,-.1,-.3);
  const philosophy=new T.Group();const outer=mesh(new T.TorusGeometry(.43,.08,8,72),dark,philosophy);outer.rotation.set(.2,.8,.3);outer.scale.set(1,1.32,1);const crossing=mesh(new T.TorusGeometry(.41,.068,12,72),dark,philosophy);crossing.rotation.set(.7,-.65,-.3);crossing.scale.set(.85,1.3,1);mesh(new T.SphereGeometry(.17,24,16),gold,philosophy);const rim=mesh(new T.TorusGeometry(.185,.012,6,48),gold,philosophy);rim.rotation.y=.2;
  // Template materials are cloned per object so focus dimming stays local.
  gold.dispose();dark.dispose();silver.dispose();paper.dispose();leather.dispose();
  return [systems,ventures,hardware,ai,finance,writing,philosophy];
}

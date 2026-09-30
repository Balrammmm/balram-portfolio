// Background-only extraction: original RGB pixels are never repainted.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const source = 'public/story/philosopher-source.png';
const {data, info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width:w, height:h} = info;
// Hand-traced shadow protection prevents the connected black backdrop from
// eating the hair, book, fingers and the deeply shaded folds of the robe.
const silhouette=`M 514 1066 Q 529 1049 547 1046 Q 557 1037 581 1041
 Q 610 1041 632 1055 Q 658 1063 670 1088 Q 687 1106 682 1129
 Q 670 1142 642 1148 L 638 1170 L 636 1186 L 641 1205 L 640 1220
 Q 653 1234 685 1240 Q 706 1245 715 1268 L 735 1277
 Q 752 1291 756 1328 Q 772 1365 770 1402 L 765 1458
 L 869 1398 Q 874 1394 882 1402 L 907 1418 L 916 1418
 Q 931 1427 938 1445 Q 941 1453 934 1457 L 927 1462
 L 882 1493 L 862 1514 L 843 1536 L 833 1548
 Q 846 1534 833 1553 L 836 1586 L 831 1652 L 819 1652
 L 816 1606 Q 810 1621 806 1658 Q 793 1683 797 1726
 L 806 1805 L 819 1865 L 810 1872 L 795 1863
 Q 807 1918 796 1972 Q 789 1997 800 2020 L 817 2048
 L 376 2048 Q 383 2014 378 1978 L 374 1904 L 366 1782
 L 350 1899 L 328 1888 Q 341 1829 337 1751 L 334 1673
 L 324 1681 L 302 1676 L 293 1679 L 291 1642
 Q 292 1619 279 1596 Q 249 1560 248 1524 Q 244 1492 256 1467
 Q 268 1442 289 1415 Q 293 1386 309 1370 L 322 1357
 Q 320 1322 346 1287 Q 365 1251 391 1246 L 416 1245
 Q 450 1227 487 1225 L 508 1220 Q 519 1198 509 1175
 Q 499 1157 505 1137 Q 494 1124 503 1107 L 510 1088 Z`;
const protectedMask=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${silhouette}" fill="white"/></svg>`)).ensureAlpha().raw().toBuffer();
const count=w*h, background=new Uint8Array(count), queue=new Int32Array(count);
let head=0,tail=0;
const dark=i=>protectedMask[i*4+3]<128&&Math.max(data[i*4],data[i*4+1],data[i*4+2])<=24;
function visit(i){if(!background[i]&&dark(i)){background[i]=1;queue[tail++]=i;}}
for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x);}
for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}
while(head<tail){const i=queue[head++],x=i%w;if(x)visit(i-1);if(x<w-1)visit(i+1);if(i>=w)visit(i-w);if(i<count-w)visit(i+w);}
// Feather only the silhouette boundary, never brightness-key the statue interior.
const mask=Buffer.from(background.map(v=>v?0:255));
// Discard detached backdrop compression specks. Keep the connected figure.
const figure=new Uint8Array(count);head=0;tail=0;
const seed=1400*w+570;queue[tail++]=seed;figure[seed]=1;
const connect=i=>{if(!figure[i]&&mask[i]){figure[i]=1;queue[tail++]=i;}};
while(head<tail){const i=queue[head++],x=i%w;if(x)connect(i-1);if(x<w-1)connect(i+1);if(i>=w)connect(i-w);if(i<count-w)connect(i+w);}
for(let i=0;i<count;i++)if(!figure[i])mask[i]=0;
const alpha=await sharp(mask,{raw:{width:w,height:h,channels:1}}).blur(.6).greyscale().raw().toBuffer();
const rgba=Buffer.from(data);
for(let i=0;i<count;i++)rgba[i*4+3]=alpha[i];
await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toFile('public/story/philosopher-cutout.png');
await fs.mkdir('work/cutout-qa',{recursive:true});
for(const [name,color] of [['graphite','#151515'],['light','#b6b3ad']]){
 const composed=await sharp({create:{width:w,height:h,channels:3,background:color}}).composite([{input:rgba,raw:{width:w,height:h,channels:4}}]).png().toBuffer();
 await sharp(composed).extract({left:200,top:1000,width:800,height:1048}).resize({width:640}).png().toFile(`work/cutout-qa/${name}.png`);
}
const saved=await sharp('public/story/philosopher-cutout.png').raw().toBuffer();
let changedRGB=0,transparent=0,softEdge=0;
for(let i=0;i<count;i++){
 for(let c=0;c<3;c++)if(saved[i*4+c]!==data[i*4+c])changedRGB++;
 if(saved[i*4+3]===0)transparent++;
 else if(saved[i*4+3]<255)softEdge++;
 if(i<1000*w||i%w<200||i%w>1000)assert.equal(saved[i*4+3],0,'Empty backdrop must be fully transparent');
}
assert.equal(changedRGB,0,'Never repaint the supplied statue');
const report={width:w,height:h,foregroundPixels:tail,transparentPixels:transparent,softEdgePixels:softEdge,changedRGB,originalRGBPreserved:true,method:'Background-connected extraction with hand-traced shadow protection; alpha only',browserQA:'Not performed: saved localhost browser denial remains in effect'};
await fs.writeFile('work/cutout-qa/alpha-checks.json',JSON.stringify(report,null,2));
console.log(report);

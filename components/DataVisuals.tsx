'use client';
import {useEffect,useRef} from 'react';
import type {ProjectMotion} from '@/lib/projects';
export function PulseVisual({phase}:{phase:number}){
 if(phase===2)return null;
 return <div className="data-visual pulse-visual" data-stage={phase}>
  <p className="diagram-label">{phase===0?'RAW REVIEWS / CLUSTERING':'ANALYSIS / PRODUCT SIGNALS'}</p>
  {phase===0?<><div className="review-stream">{['“The battery should last longer.”','“I love how simple this feels.”','“Please add an export option.”'].map((q,i)=><p key={q} style={{marginLeft:`${i*6}%`}}>{q}</p>)}</div><svg viewBox="0 0 600 100" aria-hidden="true"><path d="M20 10 Q300 10 560 80 M20 50 Q300 50 560 80 M20 90 Q300 90 560 80"/></svg><p className="cluster-caption">RECURRING VOICES → SHARED THEMES</p><small>Illustrative review fragments</small></>:<><div className="pulse-signals">{['Sentiment','Pain points','Loved features','Feature requests'].map((t,i)=><p key={t}><span>0{i+1}</span>{t}<i/></p>)}</div><div className="recommendation">↓<p>Product recommendations</p></div></>}
  <div className="diagram-footer">CSV <span>→</span> ANALYSIS <span>→</span> REPORT</div>
 </div>;
}
const tables=[['CUSTOMERS','Customer key'],['PRODUCTS','Product key'],['DATE','Date key'],['SALES CHANNEL','Channel key'],['LOCATION','Location key']];
export function RetailVisual({phase,motion}:{phase:number;motion:ProjectMotion}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(phase!==1)return;let frame=0;const tick=()=>{frame=requestAnimationFrame(tick);if(!root.current||document.hidden)return;const p=(motion.position-2)/.82;root.current.dataset.mode=p<.42?'tables':'schema';};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[motion,phase]);
 if(phase!==1)return null;
 return <div className="data-visual schema-visual" ref={root}>
  <p className="diagram-label"><span className="tables-title">STRUCTURED TABLES</span><span className="schema-title">STAR SCHEMA / ONE ANALYTICAL MODEL</span></p>
  <div className="schema-field"><svg viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true"><path d="M300 200 L90 65 M300 200 L510 65 M300 200 L90 200 M300 200 L510 200 M300 200 L300 345"/></svg>
  <div className="fact-table"><strong>FACT ORDERS</strong><span>Order-line grain</span><small>Revenue · Cost · Quantity</small></div>
  {tables.map(([t,k],i)=><div className={`dimension dimension-${i}`} key={t}><strong>{t}</strong><span>{k}</span></div>)}
  </div><div className="diagram-footer">PYTHON <span>/</span> SQL <span>/</span> POWER BI <span>/</span> DAX</div>
 </div>;
}

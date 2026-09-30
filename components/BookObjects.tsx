'use client';
import {useState} from 'react';
import {books} from '@/lib/story';
export default function BookObjects(){
 const [selected,setSelected]=useState<number|null>(null);
 return <div className="library-objects"><div className="books-stage">{books.map((b,i)=><button key={b.title} className={`book-object book-${i}`} data-selected={selected===i} data-dimmed={selected!==null&&selected!==i} aria-expanded={selected===i} aria-controls="book-detail" aria-label={`Explore ${b.title}`} onClick={()=>setSelected(selected===i?null:i)}><span className="book-spine"/><span className="book-pages"/><span className="book-back"/><span className="book-cover"><small>{i===0?'ON ATTENTION':'ON POSSIBILITY'}</small><strong>{b.title}</strong><i/><span>{b.author}</span></span></button>)}</div>
  <div className="book-detail" id="book-detail" aria-live="polite">{selected===null?<p>Select a book to open its story.</p>:<><h3>{books[selected].title}</h3><p>{books[selected].subtitle}</p><a href={books[selected].url} target="_blank" rel="noopener noreferrer">VIEW ON AMAZON ↗</a><button onClick={()=>setSelected(null)} aria-label="Close book preview">CLOSE ×</button></>}</div>
 </div>;
}

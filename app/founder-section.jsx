'use client'
import {useRef,useState} from 'react'
import {useAutoAdvance} from './auto-carousel'
import {jessicaProfile} from './jessica-profile'

export default function FounderSection({person='bettina'}){
 const isJessica=person==='jessica', name=isJessica?jessicaProfile.name:'Bettina Mattheus'
 const sectionId=isJessica?'jessica-winterholler':'bettina-mattheus',titleId=isJessica?'jessica-title':'founder-title'
 const portraits=isJessica?['confident','smile','conversation']:['laugh','wink','confident']
 const expressions=isJessica?['souverän stehend im dunklen Anzug','warm lächelnd im hellen Hosenanzug','aufmerksam im Gespräch']:['lachend, seitlich im Sessel','mit einem Augenzwinkern','stehend mit verschränkten Armen']
 const ref=useRef(null),touch=useRef(null),[active,setActive]=useState(0)
 const next=()=>setActive(i=>(i+1)%3)
 useAutoAdvance(ref,next,9000)
 return <section className={`founder-section${isJessica?' jessica-founder':''}`} id={sectionId} aria-labelledby={titleId}>
  <div className="founder-portraits" ref={ref} aria-label={`Porträts von ${name}`} aria-roledescription="Karussell" onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current!==null){const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>40)setActive(i=>(i+(delta<0?1:2))%3)}touch.current=null}}>
   <div className="founder-frames">{portraits.map((n,i)=><img key={n} src={isJessica?`/media/jessica/portrait-${n}-1122.webp`:`/media/bettina/portrait-${n}.webp`} srcSet={isJessica?`/media/jessica/portrait-${n}-560.webp 560w, /media/jessica/portrait-${n}-1122.webp 1122w`:undefined} sizes={isJessica?'(max-width:700px) calc(100vw - 48px), 43vw':undefined} width="1122" height="1402" loading="lazy" decoding="async" alt={active===i?`${name} – ${expressions[i]}`:''} aria-hidden={active!==i} className={active===i?'is-active':''}/>)}</div>
   <div className="founder-controls"><button aria-label="Vorheriges Porträt" onClick={()=>setActive(i=>(i+2)%3)}>←</button><div>{[0,1,2].map(i=><button key={i} aria-label={`Porträt ${i+1} anzeigen`} aria-pressed={active===i} onClick={()=>setActive(i)}><span/></button>)}</div><button aria-label="Nächstes Porträt" onClick={next}>→</button></div>
  </div>
  {isJessica?<div className="founder-copy"><span className="eyebrow">DIE FRAU HINTER ELYSERA</span><h2 id={titleId}>{jessicaProfile.name}</h2><p className="founder-role">{jessicaProfile.role}</p>{jessicaProfile.paragraphs.map(p=><p key={p}>{p}</p>)}</div>:<div className="founder-copy"><span className="eyebrow">DIE FRAU HINTER ELYSERA</span><h2 id="founder-title">Bettina Mattheus</h2><p className="founder-role">Mitgründerin · Produktentwicklung & Hautkonzept</p><p>Mehr als 25 Jahre Hautpraxis prägen ihren Blick auf Pflege. Als Kosmetikerin hat Bettina Mattheus Menschen beraten, als Dozentin Wissen vermittelt und Nachwuchskräfte ausgebildet.</p><p>Seit Juni 2026 verantwortet sie bei ELYSERA die Produktentwicklung und das Hautkonzept. Ihr Anspruch: Wirkstoffe, Verträglichkeit, Textur und Anwendung sollen im Alltag zusammenpassen.</p><blockquote>„Ich wollte eine Pflegeroutine entwickeln, deren Aufbau nachvollziehbar ist, deren Texturen man gerne verwendet und bei der die einzelnen Schritte sinnvoll zusammenspielen.“</blockquote><p className="founder-credit">Bettina Mattheus</p></div>}
 </section>
}

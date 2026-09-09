'use client'
import {useRef,useState} from 'react'
import {useAutoAdvance} from './auto-carousel'

export default function FounderSection(){
 const ref=useRef(null),touch=useRef(null),[active,setActive]=useState(0)
 const next=()=>setActive(i=>(i+1)%3)
 useAutoAdvance(ref,next,9000)
 return <section className="founder-section" id="bettina-mattheus" aria-labelledby="founder-title">
  <div className="founder-portraits" ref={ref} aria-label="Porträts von Bettina Mattheus" aria-roledescription="Karussell" onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current!==null){const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>40)setActive(i=>(i+(delta<0?1:2))%3)}touch.current=null}}>
   <div className="founder-frames">{[1,2,3].map((n,i)=><img key={n} src={`/media/bettina/portrait-glamour-${n}.webp`} width="1122" height="1402" loading="lazy" decoding="async" alt={active===i?`Bettina Mattheus – inszeniertes Porträt ${n}`:''} aria-hidden={active!==i} className={active===i?'is-active':''}/>)}</div>
   <div className="founder-controls"><button aria-label="Vorheriges Porträt" onClick={()=>setActive(i=>(i+2)%3)}>←</button><div>{[0,1,2].map(i=><button key={i} aria-label={`Porträt ${i+1} anzeigen`} aria-pressed={active===i} onClick={()=>setActive(i)}><span/></button>)}</div><button aria-label="Nächstes Porträt" onClick={next}>→</button></div>
  </div>
  <div className="founder-copy"><span className="eyebrow">DIE FRAU HINTER ELYSERA</span><h2 id="founder-title">Bettina Mattheus</h2><p className="founder-role">Mitgründerin · Produktentwicklung & Hautkonzept</p><p>Mehr als 25 Jahre Hautpraxis prägen ihren Blick auf Pflege. Als Kosmetikerin hat Bettina Mattheus Menschen beraten, als Dozentin Wissen vermittelt und Nachwuchskräfte ausgebildet.</p><p>Seit Juni 2026 verantwortet sie bei ELYSERA die Produktentwicklung und das Hautkonzept. Ihr Anspruch: Wirkstoffe, Verträglichkeit, Textur und Anwendung sollen im Alltag zusammenpassen.</p><blockquote>„Ich wollte eine Pflegeroutine entwickeln, deren Aufbau nachvollziehbar ist, deren Texturen man gerne verwendet und bei der die einzelnen Schritte sinnvoll zusammenspielen.“</blockquote><p className="founder-credit">Bettina Mattheus</p></div>
 </section>
}

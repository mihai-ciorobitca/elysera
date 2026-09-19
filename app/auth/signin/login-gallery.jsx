'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
const slides=[
 {src:'supercars.webp',alt:'Mann und Frau vor Ferrari und Lamborghini, mit ELYSERA Serum in der Hand',title:'Dein Stil. Dein Moment.',text:'ELYSERA begleitet dich.',position:'center 40%'},
 {src:'holiday.webp',alt:'Urlaub am Meer mit der ELYSERA Kollektion auf dem Frühstückstisch',title:'Zeit für dich.',text:'Dein Pflegeritual. Auch fern vom Alltag.',position:'center 40%'},
 {src:'business.webp',alt:'Gemeinsames Business-Meeting mit ELYSERA Produkten auf dem Tisch',title:'Gemeinsam Ideen bewegen.',text:'Willkommen in deiner ELYSERA Welt.',position:'center 40%'},
 {src:'yacht.webp',alt:'Mann und Frau auf einer Yacht mit ELYSERA Pflegeprodukten auf dem Tisch',title:'Den Moment genießen.',text:'Deine Pflege ist mit dabei.',position:'center 40%'}
]
export default function LoginGallery(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(true),[loaded,setLoaded]=useState([0])
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(mq.matches);change();mq.addEventListener('change',change);return()=>mq.removeEventListener('change',change)},[])
 useEffect(()=>{if(reduced)return;const timer=setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%slides.length)},6000);return()=>clearInterval(timer)},[reduced])
 useEffect(()=>{setLoaded(current=>current.includes(active)?current:[...current,active]);if(reduced)return;const timer=setTimeout(()=>{const next=(active+1)%slides.length;setLoaded(current=>current.includes(next)?current:[...current,next])},3000);return()=>clearTimeout(timer)},[active,reduced])
 return <section className="es-login-gallery" aria-label="ELYSERA Bildergalerie">
  {slides.map((slide,i)=><div className={`es-gallery-slide ${active===i?'is-active':''}`} aria-hidden={active!==i} key={slide.src}>{(loaded.includes(i)||active===i)&&<img src={'/media/login-lifestyle/'+slide.src} alt={slide.alt} style={{objectPosition:slide.position}} fetchPriority={i===0?'high':'low'} decoding="async"/>}<div className="es-gallery-copy"><h2>{slide.title}</h2><p>{slide.text}</p></div></div>)}
  <Link href="/" className="es-gallery-brand" aria-label="ELYSERA Startseite">ELYSERA<small>SKINCARE</small></Link>
  <div className="es-gallery-controls"><span className="es-gallery-count">0{active+1}<small> / 04</small></span><div className="es-gallery-dots">{slides.map((s,i)=><button key={s.src} type="button" aria-label={`Bild ${i+1} anzeigen`} aria-pressed={active===i} onClick={()=>setActive(i)}><span/></button>)}</div></div>
 </section>
}

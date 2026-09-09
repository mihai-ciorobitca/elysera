'use client'
import Link from 'next/link'
import {useAutoAdvance} from './auto-carousel'
import {useEffect,useRef,useState} from 'react'
import {products} from './catalog'
import ScrollMedia from './scroll-media'
import {CampaignMotion} from './campaign'
const motifs=[{key:'collection',label:'Kollektion',title:'Mehr als',accent:'Skincare.',copy:'Gezielte Peptidpflege. Drei Schritte für deine tägliche Routine.',href:'/shop/'},...products.map(p=>({key:p.step==='01'?'toner':p.step==='02'?'serum':'eye',label:p.short,title:p.short,accent:'',copy:p.role,href:`/products/${p.slug}/`}))]
export default function ReferenceHero(){
 const ref=useRef(null),touch=useRef(null)
 useAutoAdvance(ref,()=>setActive(i=>(i+1)%motifs.length),13000)
 const [active,setActive]=useState(0);const item=motifs[active]
 const [mobile,setMobile]=useState(false)
 useEffect(()=>{const mq=matchMedia('(max-width:700px)');const update=()=>setMobile(mq.matches);update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update)},[])
 return <section ref={ref} onTouchStart={e=>{touch.current=[e.touches[0].clientX,e.touches[0].clientY]}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current[0],dy=e.changedTouches[0].clientY-touch.current[1];if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)setActive(i=>(i+(dx<0?1:motifs.length-1))%motifs.length);touch.current=null}} className="atelier-hero cosmedix-hero" data-active={item.key} aria-label="Elysera Kollektion">
  <div key={`media-${item.key}`} className="atelier-hero-media" data-collection={active===0}>{active===0?<ScrollMedia name="atelier-collection" source={mobile?"/media/renewal-2026/hero-mobile.mp4":"/media/renewal-2026/hero.mp4"}><img src={mobile?"/media/renewal-2026/hero-mobile.webp":"/media/renewal-2026/hero.webp"} alt="Die vollständige Elysera Kollektion auf dunklem Stein" fetchPriority="high"/></ScrollMedia>:<CampaignMotion key={item.key} name={item.key} alt={item.label} priority/>}</div>
  <div key={`copy-${item.key}`} className="atelier-hero-copy"><span className="hero-kicker">SCIENCE MEETS BEAUTY</span><h1>{item.title}<em>{item.accent}</em></h1><p>{item.copy}{active!==0&&' Entdecke deine Pflege im Presale.'}</p><Link className="button" href={item.href}>{active===0?'Kollektion entdecken':'Produkt entdecken'}</Link></div>
  <div className="hero-service-bar" aria-label="Die ELYSERA Kollektion">
   <Link href="/shop/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 13h7v15H4zM13 7h7v21h-7zM23 15h5v13h-5zM5 9h5v4H5zM14 3h5v4h-5zM23 12h5v3h-5z"/></svg><strong>DREI PRODUKTE</strong><span>Eine Pflegeroutine</span></Link>
   <Link href="/presale/"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="21" rx="1"/><path d="M10 3v8M22 3v8M4 14h24m-18 6 4 4 8-8"/></svg><strong>PRESALE</strong><span>Unverbindlich auswählen</span></Link>
   <Link href="/routine/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C12 10 7 14 7 20a9 9 0 0 0 18 0c0-6-5-10-9-17Z"/><path d="m12 20 3 3 6-7"/></svg><strong>PEPTIDPFLEGE</strong><span>Dein tägliches Ritual</span></Link>
  </div>
  <div className="atelier-tabs" aria-label="Produktmotiv auswählen">{motifs.map((m,i)=><button key={m.key} aria-label={m.label} title={m.label} aria-pressed={active===i} onClick={()=>setActive(i)}><span className="hero-dot"/><span className="hero-tab-label">{m.label}</span></button>)}</div>
 </section>
}

'use client'
import Link from 'next/link'
import {useAutoAdvance} from './auto-carousel'
import {useEffect,useRef,useState} from 'react'
import {products} from './catalog'
import {CampaignMotion} from './campaign'
import {mediaImage,mediaSrcSet} from './media-library'
const motifs=[{key:'collection',label:'Kollektion',title:'Mehr als',accent:'Skincare.',href:'/shop/'},...products.map(p=>({key:p.step==='01'?'toner':p.step==='02'?'serum':'eye',label:p.short,title:p.short,accent:'',href:`/products/${p.slug}/`}))]
export default function ReferenceHero(){
 const ref=useRef(null),touch=useRef(null),busy=useRef(false),timer=useRef(null)
 const [active,setActive]=useState(0),[phase,setPhase]=useState('idle');const item=motifs[active]
 useEffect(()=>()=>clearTimeout(timer.current),[])
 const go=async index=>{
  if(index===active||busy.current)return
  busy.current=true
  const image=new Image();image.src=mediaImage(index===0?'hero-mobile':motifs[index].key)
  try{await image.decode()}catch{}
  if(!ref.current){busy.current=false;return}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setActive(index);busy.current=false;return}
  setPhase('leaving')
  timer.current=setTimeout(()=>{setActive(index);setPhase('entering');timer.current=setTimeout(()=>{setPhase('idle');busy.current=false},1250)},500)
 }
 useAutoAdvance(ref,()=>go((active+1)%motifs.length),13000)
 return <section ref={ref} onTouchStart={e=>{touch.current=[e.touches[0].clientX,e.touches[0].clientY]}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current[0],dy=e.changedTouches[0].clientY-touch.current[1];if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go((active+(dx<0?1:motifs.length-1))%motifs.length);touch.current=null}} className="atelier-hero cosmedix-hero" data-active={item.key} data-transition={phase} aria-label="Elysera Kollektion">
  <div className="hero-atmosphere" aria-hidden="true"><span className="hero-light-arc arc-one"/><span className="hero-light-arc arc-two"/><span className="hero-light-haze"/></div>
  <div key={`media-${item.key}`} className="atelier-hero-media" data-collection={active===0}>{active===0?<span className="campaign-motion" data-motion="collection"><picture><source media="(max-width:700px)" srcSet={mediaSrcSet('hero-mobile')} sizes="100vw"/><img src={mediaImage('hero')} srcSet={mediaSrcSet('hero')} sizes="100vw" alt="Die vollständige Elysera Kollektion auf dunklem Stein" fetchPriority="high"/></picture></span>:<CampaignMotion name={item.key} alt={item.label} priority sizes="(max-width:700px) 100vw, 50vw"/>}</div>
  <div key={`copy-${item.key}`} className="atelier-hero-copy"><span className="hero-kicker">SCIENCE MEETS BEAUTY</span><h1>{item.title}<em>{item.accent}</em></h1><Link className="button" href={item.href}>{active===0?'Kollektion':'Entdecken'}</Link><Link className="hero-brand-below" href="/" aria-label="Elysera Startseite"><svg className="elysera-original-logo" viewBox="670 8 196 208" aria-hidden="true" focusable="false"><defs><filter id="elysera-hero-gold" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  4 0 0 0 -1"/></filter></defs><image href="/media/midnight-2026/logo-reference.png" width="1536" height="1024" filter="url(#elysera-hero-gold)"/></svg></Link></div>
  <div className="hero-service-bar" aria-label="Die ELYSERA Kollektion">
   <Link href="/shop/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 13h7v15H4zM13 7h7v21h-7zM23 15h5v13h-5zM5 9h5v4H5zM14 3h5v4h-5zM23 12h5v3h-5z"/></svg><strong>DREI PRODUKTE</strong><span>Eine Pflegeroutine</span></Link>
   <Link href="/presale/"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="21" rx="1"/><path d="M10 3v8M22 3v8M4 14h24m-18 6 4 4 8-8"/></svg><strong>PRESALE</strong><span>Unverbindlich auswählen</span></Link>
   <Link href="/routine/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C12 10 7 14 7 20a9 9 0 0 0 18 0c0-6-5-10-9-17Z"/><path d="m12 20 3 3 6-7"/></svg><strong>PEPTIDPFLEGE</strong><span>Dein tägliches Ritual</span></Link>
  </div>
  <div className="atelier-tabs" aria-label="Produktmotiv auswählen">{motifs.map((m,i)=><button key={m.key} aria-label={m.label} title={m.label} aria-pressed={active===i} onClick={()=>go(i)}><span className="hero-dot"/><span className="hero-tab-label">{m.label}</span></button>)}</div>
 </section>
}

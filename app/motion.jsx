'use client'
import Link from 'next/link'
import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {usePathname} from 'next/navigation'
import {products} from './catalog'

export function CardMotion(){
 const path=usePathname()
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)')
  const animations=new Set()
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting||media.matches)return
   const el=entry.target
   el.querySelectorAll('img').forEach(image=>{if(image.closest('.campaign-motion,.portrait-loop'))return;const animation=image.animate([{transform:'scale(1.055)',clipPath:'inset(0 0 8% 0)'},{transform:'scale(1)',clipPath:'inset(0 0 0 0)'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(animation);animation.onfinish=()=>animations.delete(animation)})
   observer.unobserve(el)
  }),{threshold:.2})
  const cards=[...document.querySelectorAll('.product-card,.care-card,.skin-story-image,.finder-editorial,.science-editorial,.texture-stage')]
  cards.forEach(card=>observer.observe(card))
  const stop=()=>{if(media.matches){animations.forEach(a=>a.cancel());animations.clear()}}
  media.addEventListener('change',stop)
  return()=>{observer.disconnect();animations.forEach(a=>a.cancel());media.removeEventListener('change',stop)}
 },[path])
 return null
}

const steps=[products[1],products[0],products[2]]
const imageKeys=['toner','serum','eye']
export function ScrollRitual(){
 const stage=useRef(null),frame=useRef(0),reposition=useRef(false)
 const [step,setStep]=useState(0),[reveal,setReveal]=useState(50),[scrollMode,setScrollMode]=useState(false),[reduced,setReduced]=useState(true)
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(m.matches);setScrollMode(!m.matches)};update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[])
 useEffect(()=>{
  if(!scrollMode||reduced)return
  const update=()=>{cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{
   const el=stage.current;if(!el)return
   const rect=el.getBoundingClientRect(),distance=rect.height-innerHeight+80
   const progress=Math.min(.9999,Math.max(0,(80-rect.top)/Math.max(1,distance)))
   const chapter=progress*3
   setStep(Math.min(2,Math.floor(chapter)))
   setReveal(100-Math.round((chapter%1)*100))
  })}
  update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update)
  return()=>{cancelAnimationFrame(frame.current);removeEventListener('scroll',update);removeEventListener('resize',update)}
 },[scrollMode,reduced])
 useLayoutEffect(()=>{if(reposition.current&&stage.current){reposition.current=false;window.scrollTo({top:window.scrollY+stage.current.getBoundingClientRect().top-70,behavior:'instant'})}},[scrollMode])
 const changeMode=next=>{reposition.current=next!==scrollMode;setScrollMode(next)}
 const manualStep=i=>{changeMode(false);setStep(i);setReveal(50)}
 const p=steps[step],key=imageKeys[step]
 return <section ref={stage} className={`scroll-ritual ${scrollMode&&!reduced?'scroll-enabled':''}`} aria-label="Interaktive Pflegeroutine">
  <div className="ritual-sticky">
   <div className="ritual-heading"><h2>DREI SCHRITTE.<br/><em>DEIN RITUAL.</em></h2><div><p>{scrollMode?'Scrolle durch Produkt und Textur.':'Wähle deinen Schritt und verschiebe den Bildregler.'}</p><button className="text-link ritual-mode" aria-pressed={scrollMode} disabled={reduced} onClick={()=>changeMode(!scrollMode)}>{reduced?'Bewegung reduziert':scrollMode?'MANUELL ENTDECKEN':'BEIM SCROLLEN ENTDECKEN'}</button></div></div>
   <div className="ritual-grid">
    <div className="routine-reveal ritual-image"><img key={`product-${key}`} src={`/media/campaign-2026/${key}.webp`} alt={p.name}/><img key={`texture-${key}`} className="revealed-texture" src={`/media/campaign-2026/${key}-texture.webp`} alt={`Illustrative Textur: ${p.short}`} style={{clipPath:`inset(0 0 0 ${reveal}%)`}}/><span className="reveal-label label-product">PRODUKT</span><span className="reveal-label label-texture">TEXTUR</span><div className="reveal-divider" style={{left:`${reveal}%`}}><span aria-hidden="true">↔</span></div><input type="range" min="0" max="100" value={reveal} aria-label="Produkt und Textur vergleichen" onChange={e=>{changeMode(false);setReveal(Number(e.target.value))}}/></div>
    <div className="ritual-copy"><div className="routine-step-tabs" aria-label="Pflegeschritt auswählen">{['Vorbereiten','Pflegen','Ergänzen'].map((label,i)=><button key={label} aria-pressed={step===i} onClick={()=>manualStep(i)}><span>0{i+1}</span>{label}</button>)}</div><div key={key} className="routine-step-content"><h3>{p.name}</h3><p>{p.use}</p><p className="muted">{p.texture}</p><Link className="button outline" href={`/products/${p.slug}/`}>DAS PRODUKT ENTDECKEN →</Link></div><Link className="text-link ritual-guide" href="/routine/">DER KOMPLETTE ROUTINE-GUIDE →</Link></div>
   </div>
   <div className="ritual-progress" aria-hidden="true">{steps.map((p,i)=><span key={p.slug}><i style={{transform:`scaleX(${i<step?1:i===step?(100-reveal)/100:0})`}}/></span>)}</div>
  </div>
 </section>
}

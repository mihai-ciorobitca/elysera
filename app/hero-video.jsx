'use client'
import {useEffect,useState,useRef} from 'react'
export default function HeroVideo(){
 const [mode,setMode]=useState(null),ref=useRef(null)
 useEffect(()=>{const mobile=matchMedia('(max-width:700px)');const update=()=>setMode(mobile.matches?'mobile':'desktop');update();mobile.addEventListener('change',update);return()=>mobile.removeEventListener('change',update)},[])
 useEffect(()=>{ref.current?.play().catch(()=>{})},[mode])
 useEffect(()=>{
  const hero=ref.current?.closest('.lp-hero'),copy=hero?.querySelector('.lp-hero-copy')
  if(!hero||!copy)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,last=''
  const update=()=>{
   frame=0
   const rect=hero.getBoundingClientRect(),copyRect=copy.getBoundingClientRect()
   const progress=reduced.matches?0:Math.min(1,Math.max(0,window.scrollY/(rect.height*.85)))
   const fade=mode==='mobile'?Math.min(1,Math.max(0,(window.innerHeight*.55-copyRect.top)/copyRect.height)):progress
   const state=`${progress.toFixed(4)}:${fade.toFixed(4)}:${rect.height}`
   if(state===last)return
   last=state
   hero.style.setProperty('--hero-drift',`${mode==='mobile'||reduced.matches?0:Math.min(rect.height,Math.max(0,-rect.top))*.22}px`)
   hero.style.setProperty('--hero-scale',String(1+(mode==='mobile'?0:progress*.16)))
   hero.style.setProperty('--hero-copy-shift',`${mode==='mobile'?0:-progress*48}px`)
   hero.style.setProperty('--hero-copy-opacity',String(reduced.matches?1:Math.max(.15,1-fade*1.3)))
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule)
  reduced.addEventListener('change',schedule);update()
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);for(const name of ['--hero-drift','--hero-scale','--hero-copy-opacity','--hero-copy-shift'])hero.style.removeProperty(name)}
 },[mode])
 return <div className="lp-hero-media"><picture><source media="(max-width:700px)" srcSet="/media/wavespeed-4k/hero-mobile.webp"/><img src="/media/elysera-hero-desktop-dreamina-poster.webp" alt="Die ELYSERA Kollektion in einer animierten Produktinszenierung" fetchPriority="high"/></picture>{mode&&<><video key={mode} ref={ref} src={mode==='mobile'?'/media/renewal-2026/hero-mobile.mp4':'/media/elysera-hero-desktop-dreamina-4k.mp4'} autoPlay muted playsInline loop preload="auto" aria-hidden="true"/></>}</div>
}



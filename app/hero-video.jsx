'use client'
import {useEffect,useState,useRef} from 'react'
export default function HeroVideo(){
 const [mode,setMode]=useState(null),ref=useRef(null)
 useEffect(()=>{const mobile=matchMedia('(max-width:700px)');const update=()=>setMode(mobile.matches?'mobile':'desktop');update();mobile.addEventListener('change',update);return()=>mobile.removeEventListener('change',update)},[])
 useEffect(()=>{ref.current?.play().catch(()=>{})},[mode])
 return <div className="lp-hero-media"><picture><source media="(max-width:700px)" srcSet="/media/wavespeed-4k/hero-mobile.webp"/><img src="/media/wavespeed-4k/hero-desktop.webp" alt="Die ELYSERA Kollektion in einer animierten Produktinszenierung" fetchPriority="high"/></picture>{mode&&<><video key={mode} ref={ref} src={mode==='mobile'?'/media/renewal-2026/hero-mobile.mp4':'/media/flow-options/hero-4-4k.mp4'} autoPlay muted playsInline loop preload="auto" aria-hidden="true"/></>}</div>
}

'use client'
import {useEffect,useState,useRef} from 'react'
export default function HeroVideo(){
 const [mode,setMode]=useState(null),[paused,setPaused]=useState(false),ref=useRef(null)
 useEffect(()=>{const mobile=matchMedia('(max-width:700px)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setMode(mobile.matches?'mobile':'desktop');setPaused(reduce.matches)};update();mobile.addEventListener('change',update);reduce.addEventListener('change',update);return()=>{mobile.removeEventListener('change',update);reduce.removeEventListener('change',update)}},[])
 useEffect(()=>{const video=ref.current;if(!video)return;if(paused)video.pause();else video.play().catch(()=>setPaused(true))},[mode,paused])
 return <div className="lp-hero-media"><picture><source media="(max-width:700px)" srcSet="/media/wavespeed-4k/hero-mobile.webp"/><img src="/media/wavespeed-4k/hero-desktop.webp" alt="Die ELYSERA Kollektion in einer animierten Produktinszenierung" fetchPriority="high"/></picture>{mode&&<><video key={mode} ref={ref} src={mode==='mobile'?'/media/renewal-2026/hero-mobile.mp4':'/media/flow-options/hero-4-4k.mp4'} autoPlay={!paused} muted playsInline loop preload="auto" aria-hidden="true"/><button className="lp-hero-play" onClick={()=>setPaused(!paused)} aria-label={paused?'Hero-Video abspielen':'Hero-Video pausieren'}>{paused?'▶':'Ⅱ'}</button></>}</div>
}

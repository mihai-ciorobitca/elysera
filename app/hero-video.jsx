'use client'
import {useEffect,useState,useRef} from 'react'
export default function HeroVideo(){
 const [mode,setMode]=useState(null),[playing,setPlaying]=useState(null),[paused,setPaused]=useState(false),ref=useRef(null),selectedMode=useRef(null)
 useEffect(()=>{
  const mobile=matchMedia('(max-width:700px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection
  let idle
  const update=()=>{const next=reduced.matches||connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType)?null:mobile.matches?'mobile':'desktop';if(next!==selectedMode.current){selectedMode.current=next;setPlaying(null);setMode(next)}}
  // Give the poster and critical page resources priority over the background film.
  const start=()=>{idle=window.setTimeout(update,200)}
  if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true})
  mobile.addEventListener('change',update);reduced.addEventListener('change',update);connection?.addEventListener('change',update)
  return()=>{clearTimeout(idle);window.removeEventListener('load',start);mobile.removeEventListener('change',update);reduced.removeEventListener('change',update);connection?.removeEventListener('change',update)}
 },[])
 useEffect(()=>{
  const video=ref.current;if(!video)return
  let visible=false
  const update=()=>{if(visible&&!document.hidden&&!paused)video.play().catch(()=>{});else video.pause()}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{threshold:.01})
  observer.observe(video);document.addEventListener('visibilitychange',update)
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);video.pause()}
 },[mode,paused])
 return <><div className="lp-hero-media"><picture><source media="(max-width:700px)" srcSet="/media/wavespeed-4k/hero-mobile-560.webp 560w, /media/wavespeed-4k/hero-mobile-1120.webp 1120w, /media/wavespeed-4k/hero-mobile-1680.webp 1680w" sizes="100vw"/><img src="/media/elysera-hero-desktop-dreamina-poster.webp" alt="Die ELYSERA Kollektion in einer animierten Produktinszenierung" fetchPriority="high" decoding="async"/></picture>{mode&&<video key={mode} ref={ref} src={mode==='mobile'?'/media/hero-mobile-delivery.mp4':'/media/hero-desktop-delivery.mp4'} muted playsInline loop preload="none" aria-hidden="true" onPlaying={()=>setPlaying(mode)} onError={()=>setPlaying(null)} style={{opacity:playing===mode?1:0}}/>}</div>{mode&&<button className="hero-film-control" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Hintergrundfilm abspielen':'Hintergrundfilm pausieren'} aria-pressed={paused}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span>{paused?'Film abspielen':'Film pausieren'}</button>}</>
}



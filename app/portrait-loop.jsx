'use client'
import {useEffect,useRef,useState} from 'react'

export default function PortraitLoop({name,alt}){
 const stage=useRef(null),film=useRef(null),manualPause=useRef(false),sync=useRef(()=>{})
 const [ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[reduced,setReduced]=useState(true)
 const base=`/media/portrait-loops/${name}`
 useEffect(()=>{
  const video=film.current,element=stage.current,preference=matchMedia('(prefers-reduced-motion: reduce)')
  let visible=false,failed=false,disposed=false
  const update=()=>{
   if(disposed)return
   if(preference.matches||!visible||document.hidden||manualPause.current||failed){video.pause();return}
   video.muted=true
   if(!video.getAttribute('src')){video.src=`${base}.mp4?v=application-loop-4`;video.load()}
   video.play()?.catch(()=>{if(!disposed)setPlaying(false)})
  }
  sync.current=update
  const changePreference=()=>{
   setReduced(preference.matches)
   if(preference.matches){video.pause();setReady(false);video.removeAttribute('src');video.load()}
   else update()
  }
  const loaded=()=>{if(!preference.matches&&!failed){setReady(true);update()}}
  const error=()=>{failed=true;setReady(false);setPlaying(false);video.pause()}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.12;update()},{threshold:[0,.12]})
  observer.observe(element)
  video.addEventListener('loadeddata',loaded);video.addEventListener('error',error)
  document.addEventListener('visibilitychange',update);preference.addEventListener('change',changePreference)
  changePreference()
  return()=>{
   disposed=true;sync.current=()=>{};observer.disconnect();video.pause()
   video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',error)
   document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',changePreference)
   video.removeAttribute('src');video.load()
  }
 },[base])
 const toggle=()=>{manualPause.current=playing;sync.current()}
 return <div ref={stage} className="portrait-loop" data-portrait-loop={name} data-ready={ready}>
  <img src={`${base}.webp?v=application-loop-4`} alt={alt} loading="lazy" decoding="async"/>
  <video ref={film} loop muted playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>
  {ready&&!reduced&&<button className="portrait-loop-toggle" onClick={toggle} aria-label={`${alt}: ${playing?'Video pausieren':'Video abspielen'}`}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">{playing?<><rect x="5" y="3" width="3" height="14"/><rect x="12" y="3" width="3" height="14"/></>:<path d="M5 2 17 10 5 18Z"/>}</svg>{playing?'Pause':'Abspielen'}</button>}
 </div>
}

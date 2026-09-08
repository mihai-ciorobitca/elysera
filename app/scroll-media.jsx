'use client'
import {useEffect,useRef,useState} from 'react'

// The reviewed exports have short GOPs so seeking works in both scroll directions.
export const cardFilms=Object.fromEntries(['serum','toner','eye','serum-texture','toner-texture','eye-texture','hero-mobile','home-story','home-finder'].map(name=>[name,`/media/card-motion/${name}.mp4`]))

export default function ScrollMedia({name,children}){
 const container=useRef(null),film=useRef(null)
 const [ready,setReady]=useState(false)
 const src=cardFilms[name]
 useEffect(()=>{
  const element=container.current,video=film.current
  if(!element||!video||!src)return
  const preference=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,near=false,failed=false,observer
  const update=()=>{
   if(frame||preference.matches||failed||document.hidden||!near)return
   frame=requestAnimationFrame(()=>{
    frame=0
    if(preference.matches||document.hidden||!near||!Number.isFinite(video.duration))return
    const rect=element.getBoundingClientRect()
    const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)))
    const target=Math.min(video.duration-.08,progress*video.duration)
    // seeked schedules the latest scroll position instead of queuing stale seeks.
    if(!video.seeking&&Math.abs(video.currentTime-target)>1/30)video.currentTime=target
   })
  }
  const loaded=()=>{if(!preference.matches){setReady(true);update()}}
  const stop=()=>{cancelAnimationFrame(frame);frame=0;video.pause()}
  const error=()=>{failed=true;stop();setReady(false)}
  const visibility=()=>{if(document.hidden)stop();else update()}
  const configure=()=>{
   observer?.disconnect();stop();near=false
   if(preference.matches){setReady(false);video.removeAttribute('src');video.load();return}
   failed=false
   observer=new IntersectionObserver(entries=>{
    near=entries[0].isIntersecting
    if(near){if(!video.getAttribute('src')){video.src=src;video.load()}update()}
    else stop()
   },{rootMargin:'300px 0px'})
   observer.observe(element)
  }
  video.addEventListener('loadeddata',loaded)
  video.addEventListener('loadedmetadata',update)
  video.addEventListener('seeked',update)
  video.addEventListener('error',error)
  window.addEventListener('scroll',update,{passive:true})
  window.addEventListener('resize',update)
  document.addEventListener('visibilitychange',visibility)
  preference.addEventListener('change',configure)
  configure()
  return()=>{
   observer?.disconnect();stop()
   video.removeEventListener('loadeddata',loaded)
   video.removeEventListener('loadedmetadata',update)
   video.removeEventListener('seeked',update)
   video.removeEventListener('error',error)
   window.removeEventListener('scroll',update)
   window.removeEventListener('resize',update)
   document.removeEventListener('visibilitychange',visibility)
   preference.removeEventListener('change',configure)
   video.removeAttribute('src');video.load()
  }
 },[src])
 return <span ref={container} className="campaign-motion" data-motion={name} data-ready={ready}>{children}{src&&<video ref={film} muted playsInline preload="none" aria-hidden="true" tabIndex={-1}/>}</span>
}

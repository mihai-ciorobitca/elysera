'use client'
import {useEffect,useRef,useState} from 'react'
import {mediaVideo} from './media-library'
// Scrolling controls visibility, never playback time.
export default function ScrollMedia({name,children,source}){
 const container=useRef(null),film=useRef(null)
 const [ready,setReady]=useState(false)
 const src=source||mediaVideo(name)
 useEffect(()=>{
  const element=container.current,video=film.current
  setReady(false)
  if(!element||!video||!src)return
  const preference=matchMedia('(prefers-reduced-motion: reduce)')
  let visible=false,failed=false,disposed=false
  const update=()=>{
   if(disposed)return
   if(preference.matches||!visible||document.hidden||failed){video.pause();return}
   if(!video.getAttribute('src')){video.src=src;video.load()}
   video.play()?.catch(()=>{})
  }
  const loaded=()=>{if(!preference.matches&&!failed){setReady(true);update()}}
  const error=()=>{failed=true;setReady(false);video.pause()}
  const configure=()=>{if(preference.matches){video.pause();setReady(false);video.removeAttribute('src');video.load()}else update()}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()},{threshold:0.05})
  observer.observe(element)
  video.addEventListener('loadeddata',loaded);video.addEventListener('error',error)
  document.addEventListener('visibilitychange',update);preference.addEventListener('change',configure)
  configure()
  return()=>{disposed=true;observer.disconnect();video.pause();video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',error);document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',configure);video.removeAttribute('src');video.load()}
 },[src])
 return <span ref={container} className="campaign-motion" data-motion={name} data-ready={ready}>{children}{src&&<video ref={film} loop muted playsInline preload="none" aria-hidden="true" tabIndex={-1}/>}</span>
}

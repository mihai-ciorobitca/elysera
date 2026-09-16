'use client'

import {useState} from 'react'

export default function SplitVideo({src,poster,alt}){
 const [ready,setReady]=useState(false)
 return <>
  <img src={poster} alt={alt} decoding="async"/>
  <video src={src} poster={poster} autoPlay muted playsInline loop preload="auto" aria-hidden="true" onPlaying={()=>setReady(true)} onError={()=>setReady(false)} onEmptied={()=>setReady(false)} style={{opacity:ready?1:0}}/>
 </>
}

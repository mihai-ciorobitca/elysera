'use client'
import {useState} from 'react'
export default function MotionControl(){
 const [paused,setPaused]=useState(false)
 return <button className="motion-control" aria-label={paused?'Animationen abspielen':'Animationen pausieren'} title={paused?'Animationen abspielen':'Animationen pausieren'} aria-pressed={paused} onClick={()=>{const next=!paused;setPaused(next);document.documentElement.dataset.motionPaused=String(next);document.dispatchEvent(new Event('elysera-motion'))}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused?<path d="M4 2 13 8 4 14Z"/>:<path d="M3 2h3v12H3zM10 2h3v12h-3z"/>}</svg></button>
}

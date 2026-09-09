'use client'
import {Children,useEffect,useRef,useState} from 'react'

// Only advance while the section is visible and the visitor is not interacting.
export function useAutoAdvance(ref,advance,delay=7000){
 const callback=useRef(advance)
 callback.current=advance
 useEffect(()=>{
  const node=ref.current;if(!node)return
  const motion=matchMedia('(prefers-reduced-motion: reduce)')
  let visible=false,hover=false,focus=false,timer
  const schedule=()=>{clearTimeout(timer);if(visible&&!hover&&!focus&&!document.hidden&&!motion.matches)timer=setTimeout(()=>{callback.current();schedule()},delay)}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule()},{threshold:0.35})
  const enter=e=>{if(e.pointerType==='mouse'){hover=true;schedule()}}
  const leave=()=>{hover=false;schedule()}
  const focusIn=()=>{focus=true;schedule()}
  const focusOut=e=>{focus=node.contains(e.relatedTarget);schedule()}
  observer.observe(node)
  node.addEventListener('pointerenter',enter);node.addEventListener('pointerleave',leave)
  node.addEventListener('focusin',focusIn);node.addEventListener('focusout',focusOut)
  node.addEventListener('pointerdown',schedule);node.addEventListener('touchend',schedule)
  document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',schedule)
  return()=>{clearTimeout(timer);observer.disconnect();node.removeEventListener('pointerenter',enter);node.removeEventListener('pointerleave',leave);node.removeEventListener('focusin',focusIn);node.removeEventListener('focusout',focusOut);node.removeEventListener('pointerdown',schedule);node.removeEventListener('touchend',schedule);document.removeEventListener('visibilitychange',schedule);motion.removeEventListener('change',schedule)}
 },[ref,delay])
}

export default function AutoCarousel({children,className,label}){
 const ref=useRef(null),[active,setActive]=useState(0)
 const items=Children.toArray(children)
 const go=index=>{
  const rail=ref.current;if(!rail||rail.scrollWidth<=rail.clientWidth+2)return
  const child=rail.children[index],first=rail.children[0]
  rail.scrollTo({left:child.offsetLeft-first.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
 }
 useAutoAdvance(ref,()=>go((active+1)%items.length))
 const sync=()=>{const rail=ref.current,first=rail.children[0];let closest=0;Array.from(rail.children).forEach((child,i)=>{if(Math.abs(child.offsetLeft-first.offsetLeft-rail.scrollLeft)<Math.abs(rail.children[closest].offsetLeft-first.offsetLeft-rail.scrollLeft))closest=i});setActive(closest)}
 return <><div ref={ref} className={`${className} auto-rail`} onScroll={sync} aria-label={label}>{items}</div><nav className="carousel-dots" aria-label={`${label} auswählen`}>{items.map((_,i)=><button type="button" key={i} aria-label={`${label}: ${i+1} von ${items.length}`} aria-pressed={active===i} onClick={()=>go(i)}><span/></button>)}</nav></>
}

'use client'
import {useEffect,useState} from 'react'
const steps=[['01','Vorbereiten'],['02','Pflegen'],['03','Ergänzen']]
export default function RitualNavigation(){
 const [active,setActive]=useState('01')
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)
   if(visible[0])setActive(visible[0].target.id.replace('ritual-',''))
  },{rootMargin:'-15% 0px -35% 0px',threshold:[0,.2,.5]})
  document.querySelectorAll('.routine-detail[id]').forEach(el=>observer.observe(el))
  return()=>observer.disconnect()
 },[])
 return <nav className="ritual-navigation" aria-label="Dein Pflegeritual">{steps.map(([id,label])=><a key={id} href={`#ritual-${id}`} aria-current={active===id?'step':undefined}><span>{id}</span>{label}</a>)}</nav>
}

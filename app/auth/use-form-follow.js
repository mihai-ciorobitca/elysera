'use client'
import {useEffect} from 'react'
export default function useFormFollow(){
 useEffect(()=>{
  let timer,observed;
  const resize=new ResizeObserver(()=>follow());
  const viewport=window.visualViewport;
  const follow=()=>{
   clearTimeout(timer);
   const field=document.activeElement;
   if(!field?.matches('input:not([type=hidden]),select,textarea,button[aria-haspopup="listbox"],button[role="option"]')||!field.closest('.es-login-form,.es-profile-details'))return;
   const card=field.closest('.es-compact-select,.es-street-search,.es-password')||field.closest('label')||field;
   if(observed!==card){resize.disconnect();observed=card;resize.observe(card)}
   timer=setTimeout(()=>{
    if(document.activeElement!==field)return;
    const top=viewport?.offsetTop||0,height=viewport?.height||innerHeight;
    const bounds=card.getBoundingClientRect();
    const target=top+Math.max(16,(height-bounds.height)/2);
    if(Math.abs(bounds.top-target)>8)window.scrollBy({top:bounds.top-target,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   },160);
  };
  document.addEventListener('focusin',follow);document.addEventListener('click',follow);viewport?.addEventListener('resize',follow);
  return()=>{clearTimeout(timer);resize.disconnect();document.removeEventListener('focusin',follow);document.removeEventListener('click',follow);viewport?.removeEventListener('resize',follow)};
 },[]);
}

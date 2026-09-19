'use client'
import {useEffect} from 'react'
export default function useFormFollow(){
 useEffect(()=>{
  let timer;
  const viewport=window.visualViewport;
  const follow=()=>{
   clearTimeout(timer);
   timer=setTimeout(()=>{
    const field=document.activeElement;
    if(!field?.matches('input:not([type=hidden]),select,textarea,button[aria-haspopup="listbox"]')||!field.closest('.es-login-form,.es-profile-details'))return;
    // Reveal covered fields without moving visible fields or expanding menus.
    const top=(viewport?.offsetTop||0)+16,bottom=(viewport?.offsetTop||0)+(viewport?.height||innerHeight)-16;
    const bounds=field.getBoundingClientRect();
    const delta=bounds.top<top?bounds.top-top:bounds.bottom>bottom?bounds.bottom-bottom:0;
    if(delta)window.scrollBy({top:delta,behavior:'instant'});
   },160);
  };
  document.addEventListener('focusin',follow);viewport?.addEventListener('resize',follow);
  return()=>{clearTimeout(timer);document.removeEventListener('focusin',follow);viewport?.removeEventListener('resize',follow)};
 },[]);
}

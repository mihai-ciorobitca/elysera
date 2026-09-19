'use client'
import {useEffect,useId,useRef,useState} from 'react'
import {matchesOption} from '../../lib/auth/countries.mjs'
import './compact-select.css'

export default function CompactSelect({label,value,onChange,options,placeholder='Bitte wählen',searchable=false,required=false}){
 const id=useId(),root=useRef(null),trigger=useRef(null),search=useRef(null);
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const items=options.map(option=>typeof option==='string'?{value:option,label:option}:option);
 const filtered=items.filter(item=>matchesOption(item,query));
 const selected=items.find(item=>item.value===value);
 useEffect(()=>{if(!open)return;const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};document.addEventListener('pointerdown',close);if(searchable)search.current?.focus({preventScroll:true});return()=>document.removeEventListener('pointerdown',close)},[open,searchable]);
 const choose=item=>{onChange(item.value);setOpen(false);setQuery('');trigger.current?.focus({preventScroll:true})};
 const keys=e=>{
  if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.current?.focus({preventScroll:true});return}
  // Enter in a search field must never submit the surrounding registration form.
  if(e.key==='Enter'&&e.target===search.current){e.preventDefault();if(filtered.length)choose(filtered[0]);return}
  if(['Home','End'].includes(e.key)&&e.target===search.current)return;
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
   e.preventDefault();if(!open){setQuery('');setOpen(true);return}
   const buttons=Array.from(root.current.querySelectorAll('[role="option"]'));if(!buttons.length)return;
   const index=buttons.indexOf(document.activeElement);
   const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?Math.min(index+1,buttons.length-1):Math.max(index-1,0);
   buttons[next].focus({preventScroll:true});
   const list=buttons[next].parentElement,option=buttons[next];
   if(option.offsetTop<list.scrollTop)list.scrollTop=option.offsetTop;
   else if(option.offsetTop+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=option.offsetTop+option.offsetHeight-list.clientHeight;
  }
 };
 return <div className="es-compact-select" ref={root} onKeyDown={keys} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}}>
  <span className="es-compact-label" id={id+'-label'}>{label}</span>
  {required&&<select className="es-compact-validation" aria-hidden="true" tabIndex={-1} required value={value} onChange={e=>onChange(e.target.value)} onInvalid={e=>{e.preventDefault();setOpen(true);trigger.current?.focus()}}><option value=""/>{items.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>}
  <button ref={trigger} type="button" className="es-compact-trigger" aria-labelledby={id+'-label '+id+'-value'} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={()=>{setQuery('');setOpen(!open)}}><span id={id+'-value'}>{selected?.label||placeholder}</span><span aria-hidden="true">⌄</span></button>
  {open&&<div className="es-compact-panel">
   {searchable&&<input ref={search} className="es-compact-search" type="search" autoComplete="off" enterKeyHint="done" aria-controls={id} aria-label={label+' suchen'} placeholder={label+' suchen …'} value={query} onChange={e=>setQuery(e.target.value)}/>}
   <div id={id} role="listbox" aria-labelledby={id+'-label'} className="es-compact-options">{filtered.map(item=><button type="button" role="option" tabIndex={-1} aria-selected={item.value===value} className="es-compact-option" key={item.value} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item)}><span>{item.label}</span>{item.value===value&&<span aria-hidden="true">✓</span>}</button>)}{!filtered.length&&<p className="es-compact-empty" role="status">Kein Land gefunden.</p>}</div>
  </div>}
 </div>
}

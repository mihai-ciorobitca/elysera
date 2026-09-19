'use client'
import {useEffect,useId,useRef,useState} from 'react'
import {countryCode} from '../../lib/auth/countries.mjs'
import {matchesAddress,applyAddress} from '../../lib/auth/address-options.mjs'
import './address-search.css'

// Session-only, bounded cache; never persist personal address queries to disk.
const suggestionsCache=new Map();
let configuration;
function getKey(){
 if(!configuration)configuration=fetch('/api/address/config',{cache:'no-store'}).then(async response=>{
  if(!response.ok)throw new Error('Unavailable');return (await response.json()).key;
 }).catch(error=>{configuration=null;throw error});
 return configuration;
}
const normalized=text=>(text||'').trim().toLocaleLowerCase('de');
function remember(key,entry){
 if(suggestionsCache.size>=100)suggestionsCache.delete(suggestionsCache.keys().next().value);
 suggestionsCache.set(key,{...entry,expires:Date.now()+5*60*1000});
}

export default function AddressSearch({value,onChange,mode="street"}) {
 const postal=mode==='postcode',field=postal?'postalCode':'street',query=value[field]||'',label=postal?'Postleitzahl':'Straße';
 const id=useId(),input=useRef(null),sequence=useRef(0),current=useRef({value,onChange});
 current.current={value,onChange};
 const [focused,setFocused]=useState(false),[items,setItems]=useState([]),[status,setStatus]=useState(''),[index,setIndex]=useState(-1),[selected,setSelected]=useState('');
 const context=(postal?[value.country]:[value.postalCode,value.city,value.country]).join('|');
 useEffect(()=>{setSelected('')},[context]);
 useEffect(()=>{
  const request=++sequence.current;
  setItems([]);setIndex(-1);setStatus('');
  if(!focused||(!postal&&!value.postalCode?.trim())||query.trim().length<(postal?2:3)||query===selected)return;
  const cacheContext=mode+'|'+context,term=normalized(query),cacheKey=JSON.stringify([cacheContext,term]);
  const cached=suggestionsCache.get(cacheKey);
  if(cached&&cached.expires>Date.now()){setItems(cached.items);return}
  for(const entry of [...suggestionsCache.values()].reverse()){
   if(entry.expires>Date.now()&&entry.context===cacheContext&&term.startsWith(entry.term)){
    const matching=entry.items.filter(item=>normalized(postal?item.postalCode:item.street).startsWith(term));
    if(matching.length){setItems(matching);break}
   }
  }
  const keyReady=getKey();keyReady.catch(()=>{});
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   setStatus(postal?'Postleitzahlen werden gesucht …':'Straßen werden gesucht …');
   try{
    const apiKey=await keyReady;
    if(request!==sequence.current)return;
    const params=new URLSearchParams({text:postal?query:[value.street,value.postalCode,value.city,value.country].filter(Boolean).join(', '),type:mode,lang:'de',format:'json',limit:'8',apiKey});
    if(value.country){const code=countryCode(value.country);if(code)params.set('filter','countrycode:'+code)}
    const response=await fetch('https://api.geoapify.com/v1/geocode/autocomplete?'+params,{signal:controller.signal});
    if(!response.ok)throw new Error('Unavailable');
    const data=await response.json();
    if(request!==sequence.current)return;
    const predictions=(data.results||[]).filter(item=>matchesAddress(item,value,query,postal)).slice(0,5).map(item=>{
     let country=item.country;
     try{if(item.country_code)country=new Intl.DisplayNames(['de'],{type:'region'}).of(item.country_code.toUpperCase())}catch{}
     return {street:item.street,postalCode:item.postcode||'',city:item.city||item.town||item.village||'',country,houseNumber:item.housenumber||'',text:postal?[item.postcode,item.city||item.town||item.village||item.county,item.state].filter(Boolean).join(' · '):item.formatted,placeId:item.place_id};
    });
    remember(cacheKey,{context:cacheContext,term,items:predictions});
    setItems(predictions);setStatus(predictions.length?'':postal?'Keine passende PLZ gefunden. Du kannst sie selbst eingeben.':'Keine passende Straße gefunden. Du kannst sie selbst eingeben.');
   }catch{if(request===sequence.current)setStatus('Vorschläge sind derzeit nicht verfügbar. Bitte selbst eingeben.')}
  },180);
  return()=>{clearTimeout(timer);controller.abort();sequence.current++};
 },[focused,query,context,selected,postal,mode]);
 const choose=async prediction=>{
  const request=++sequence.current;setItems([]);setStatus('Adresse wird übernommen …');
  try{
   const address=prediction,latest=current.current;
   if(postal){setSelected(address.postalCode);latest.onChange(applyAddress(latest.value,address,true));setFocused(false);setStatus('PLZ übernommen. Bitte Ort prüfen und Straße eingeben.');return}
   if(address.postalCode&&address.postalCode.replace(/\s/g,'').toLowerCase()!==latest.value.postalCode.replace(/\s/g,'').toLowerCase()){
    setStatus('Dieser Vorschlag hat eine andere PLZ. Bitte prüfe deine PLZ oder wähle eine andere Straße.');return;
   }
   if(!address.street){setStatus('Bitte wähle eine Straße oder gib sie selbst ein.');return}
   setSelected(address.street);
   latest.onChange(applyAddress(latest.value,address,false));
   setFocused(false);setStatus('Straße übernommen. Bitte Hausnummer ergänzen und Angaben prüfen.');
  }catch{if(request===sequence.current)setStatus('Bitte gib deine Adresse selbst ein.')}
 };
 const open=focused&&items.length>0;
 return <div className="es-street-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
  <label htmlFor={id}>{label}</label>
  <input ref={input} id={id} type="text" required maxLength={postal?24:160} autoComplete={postal?"postal-code":"address-line1"} role="combobox" aria-autocomplete="list" aria-expanded={!!open} aria-controls={open?id+'-list':undefined} aria-activedescendant={open&&index>=0?id+'-'+index:undefined} aria-describedby={id+'-help'} value={query} onFocus={()=>{setFocused(true);getKey().catch(()=>{})}} onChange={e=>{setSelected('');setFocused(true);onChange({...value,[field]:e.target.value})}} onKeyDown={e=>{
   if(e.key==='Escape'){e.preventDefault();setFocused(false)}
   if(open&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setIndex(i=>e.key==='ArrowDown'?Math.min(i+1,items.length-1):Math.max(i-1,0))}
   if(open&&e.key==='Enter'&&index>=0){e.preventDefault();choose(items[index])}
  }}/>
  {open&&<div className="es-street-panel"><div role="listbox" id={id+'-list'} aria-label={postal?"Postleitzahlvorschläge":"Straßenvorschläge"}>{items.map((item,i)=><button key={item.placeId||i} id={id+'-'+i} type="button" role="option" aria-selected={index===i} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item)}>{item.text.toString()}</button>)}</div><small><a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></small></div>}
  <p id={id+'-help'} role="status">{status||(postal?'PLZ eintippen und den passenden Ort auswählen.':!value.postalCode?'Bitte zuerst deine Postleitzahl eingeben.':'Straße eingeben und Vorschlag wählen oder frei ausfüllen.')}</p>
 </div>
}

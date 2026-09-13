'use client'
import {useState} from 'react'
import data from './phone-countries.json'
const names=new Intl.DisplayNames(['de'],{type:'region'});
const countries=data.map(c=>({...c,name:names.of(c.iso)})).sort((a,b)=>a.name.localeCompare(b.name,'de'));
export default function PhoneField({value,country,onChange}){
 const [chosen,setChosen]=useState('');
 const international=value.trim().replace(/^00/,'+');
 const detected=international.startsWith('+')?[...countries].sort((a,b)=>b.dialCode.length-a.dialCode.length).find(c=>international.slice(1).startsWith(c.dialCode)):null;
 const selected=countries.find(c=>c.iso===chosen&&(!detected||c.dialCode===detected.dialCode))||detected||countries.find(c=>c.name===country)||countries.find(c=>c.iso==='DE');
 return <div className="es-phone-field"><label>Telefonnummer<input type="tel" autoComplete="tel" inputMode="tel" maxLength={30} placeholder={'+'+selected.dialCode+' …'} value={value} onFocus={()=>{if(!value)onChange('+'+selected.dialCode+' ')}} onChange={e=>onChange(e.target.value)} onBlur={()=>{if(value.trim()==='+'+selected.dialCode)onChange('')}}/></label><small>Mit Ländervorwahl eingeben, z. B. +49 für Deutschland.</small></div>
}

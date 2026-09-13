'use client'
import {useEffect,useState} from 'react'
import {faqs} from './catalog'
export default function DynamicFAQ({limit,locale='de'}){
 const [entries,setEntries]=useState(faqs.map(([question,answer])=>({question,answer})))
 useEffect(()=>{const controller=new AbortController();fetch(`/api/faqs?locale=${encodeURIComponent(locale)}`,{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(Array.isArray(data.entries))setEntries(data.entries)}).catch(()=>{});return()=>controller.abort()},[locale])
 return <div className="faq-list">{entries.slice(0,limit??entries.length).map(({question,answer},i)=><details key={`${i}-${question}`}><summary><span className="faq-question">{question}</span><span className="plus">+</span></summary><p>{answer}</p></details>)}</div>
}

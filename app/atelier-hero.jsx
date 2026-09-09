'use client'
import Link from 'next/link'
import {useState} from 'react'
import {products} from './catalog'
import ScrollMedia from './scroll-media'
import {CampaignMotion} from './campaign'
const motifs=[{key:'collection',label:'Kollektion',title:'Drei Schritte.',accent:'Deine Routine.',copy:'Gezielte Peptidpflege. Für deinen täglichen Moment.',href:'/shop/'},...products.map(p=>({key:p.step==='01'?'toner':p.step==='02'?'serum':'eye',label:p.short,title:p.short,accent:'',copy:p.role,href:`/products/${p.slug}/`}))]
export default function AtelierHero(){
 const [active,setActive]=useState(0);const item=motifs[active]
 return <section className="atelier-hero" aria-label="Elysera Kollektion"><div className="atelier-hero-media" data-collection={active===0}>{active===0?<ScrollMedia name="atelier-collection" source="/media/atelier-2026/collection-loop.mp4"><img src="/media/atelier-2026/collection-loop.webp" alt="Die vollständige Elysera Kollektion auf dunklem Stein" fetchPriority="high"/></ScrollMedia>:<CampaignMotion key={item.key} name={item.key} alt={item.label} priority/>}</div><div className="atelier-hero-copy"><h1>{item.title}<em>{item.accent}</em></h1><p>{item.copy}</p><Link className="button" href={item.href}>{active===0?'Kollektion entdecken':'Produkt entdecken'}<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 12h17m-6-6 6 6-6 6"/></svg></Link><span className="atelier-presale">Presale · Deine unverbindliche Auswahl</span></div><div className="atelier-tabs" aria-label="Produktmotiv auswählen">{motifs.map((m,i)=><button key={m.key} aria-pressed={active===i} onClick={()=>setActive(i)}>{i===0?'Kollektion':m.label.replace('Renewal ','').replace('Balance ','').replace('Contour ','')}</button>)}</div></section>
}

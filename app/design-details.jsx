import Link from 'next/link'
import {products} from './catalog'

export function DetailIcon({name='ritual',className=''}) {
 const shapes={
  texture:<><path d="M20 5c-3 5-8 10-8 15a8 8 0 0 0 16 0c0-5-5-10-8-15Z"/><path d="M16 21a4 4 0 0 0 4 4M7 31c0 3 26 3 26 0"/><path className="icon-accent" d="M30 9v6m-3-3h6"/></>,
  peptide:<><path d="m12 12 15 4-5 16-10-20Z"/><circle cx="12" cy="12" r="5"/><circle cx="27" cy="16" r="4"/><circle cx="22" cy="32" r="3"/><path className="icon-accent" d="M27 5h6m-3-3v6"/></>,
  ritual:<><path d="M10 8a15 15 0 1 1-5 19M5 16A15 15 0 0 1 10 8"/><path d="M5 7v9h9M20 11v10l6 4"/><circle className="icon-accent" cx="20" cy="21" r="2"/></>,
  calendar:<><rect x="7" y="9" width="26" height="25" rx="3"/><path d="M13 5v8M27 5v8M7 18h26m-18 8 4 4 7-8"/></>,
  contact:<><path d="M6 8h28v21H19l-8 6v-6H6V8Z"/><path d="M12 15h16M12 21h10"/></>,
  account:<><circle cx="20" cy="13" r="7"/><path d="M7 35v-3a13 13 0 0 1 26 0v3M13 35h14"/></>,
  order:<><path d="m6 12 14-7 14 7v18l-14 7-14-7V12Z"/><path d="m6 12 14 7 14-7M20 19v18M13 8.5l14 7v8"/></>,
  arrow:<path d="M8 20h24M22 10l10 10-10 10"/>,
 }
 return <svg className={`detail-icon ${className}`} width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]||shapes.ritual}</svg>
}

export function DeliveryOverview(){return <div className="delivery-overview" aria-label="Geplante Auslieferung der Produkte"><ul>{products.map(p=><li key={p.slug} className="delivery-entry"><div className="delivery-product"><img src={p.image} alt="" width="64" height="80" loading="lazy"/><div><h3>{p.short}</h3><span>{p.volume}</span></div></div><div className="delivery-status"><span className="delivery-label"><DetailIcon name="calendar"/>Geplante Auslieferung</span><p>{p.delivery}</p></div><Link className="delivery-link" href={`/products/${p.slug}/`} aria-label={`${p.short} entdecken`}><span>Produkt entdecken</span><DetailIcon name="arrow"/></Link></li>)}</ul></div>}

const stories=[
 {image:'glass-texture',title:'Texturen entdecken',copy:'Leichte Schichten. Ein besonderes Hautgefühl.',href:'/science/',icon:'texture',alt:'Illustrative Stillleben-Aufnahme: bläulicher Geltropfen und Glas auf hellem Stein'},
 {image:'quiet-ritual',title:'Zeit für dein Ritual',copy:'Drei Schritte, die in deinen Alltag passen.',href:'/routine/',icon:'ritual',alt:'Illustrative Stillleben-Aufnahme: Handtuch, Wasserschale und goldfarbenes Objekt'},
]
export function EditorialDiscover(){return <section className="editorial-discover" aria-label="Pflege und Texturen entdecken"><div className="editorial-discover-grid">{stories.map(s=><Link className="editorial-discover-card" key={s.image} href={s.href}><div className="editorial-discover-image"><img src={`/media/editorial-2026/${s.image}-1280.webp`} srcSet={`/media/editorial-2026/${s.image}-640.webp 640w, /media/editorial-2026/${s.image}-1280.webp 1280w`} sizes="(max-width:700px) 100vw, 50vw" width="1280" height="853" alt={s.alt} loading="lazy" decoding="async"/></div><div className="editorial-discover-copy"><DetailIcon name={s.icon}/><h2>{s.title}</h2><p>{s.copy}</p><span className="editorial-discover-action">Entdecken <span><DetailIcon name="arrow"/></span></span></div></Link>)}</div><small className="editorial-image-note">KI-generierte Stillleben zur Illustration.</small></section>}

import {pageMetadata} from '../../../lib/seo.mjs'
import {products,prices} from '../../catalog'
import {RoutineSet} from '../../storefront'
import Link from 'next/link'
export const metadata=pageMetadata('The Peptide Ritual Set','Die komplette ELYSERA Routine: Balance Prepeptide Toner, Renewal Serum und Contour Lift Eye Cream in einem Set.','/products/peptide-ritual-set','/media/atelier-2026/collection.webp')
const contents=[products[1],products[0],products[2]]
export default function SetPage(){return <section className="section set-detail-page">
 <header className="set-detail-heading"><h1>The Peptide<br/><em>Ritual Set</em></h1><div><p>Drei aufeinander abgestimmte Schritte. Entdecke, was in deiner kompletten ELYSERA Routine steckt.</p><a className="text-link" href="#set-contents">DAS SET IM DETAIL ↓</a></div></header>
 <div className="set-detail-lineup" id="set-contents">{contents.map((p,i)=><article key={p.slug}><Link href={'/products/'+p.slug}><img src={'/media/atelier-2026/'+['toner','serum','eye'][i]+'.webp'} width="600" height="800" alt={p.name} fetchPriority={i===0?'high':'auto'}/><span className="set-step">{p.step} · {['Vorbereiten','Pflegen','Ergänzen'][i]}</span><h2>{p.name}</h2></Link><p>{p.volume} · {p.texture}</p></article>)}</div>
 <div className="set-detail-order"><div><h2>Deine vollständige Routine.</h2><p><strong>{prices['peptide-ritual-set']} €</strong> <span>statt {contents.reduce((sum,p)=>sum+prices[p.slug],0)} € bei Einzelkauf</span></p><p>100 ml Toner · 30 ml Serum · 15 ml Eye Cream</p></div><div><RoutineSet label="SET VORMERKEN"/><p>Nur auf diesem Gerät speichern.<br/>Kein Kauf, keine Bestellung.</p></div></div>
 <section className="set-detail-guide"><h2>Eine klare Reihenfolge.<br/><em>Jeden Tag.</em></h2><div>{contents.map(p=><details key={p.slug}><summary>{p.step} · {p.short}</summary><p>{p.use}</p><Link className="text-link" href={'/products/'+p.slug}>PRODUKT ENTDECKEN →</Link></details>)}<details><summary>Presale & Lieferung</summary><p>Die Auslieferung des Serums ist für Mitte Oktober 2026 geplant. Die Liefertermine für Toner, Augencreme und das vollständige Set werden vor Bestellstart bekannt gegeben.</p><Link className="text-link" href="/presale">PRESALE & LIEFERUNG →</Link></details></div></section>
 </section>}


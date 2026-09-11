import Link from 'next/link'
import {products} from './catalog'
import {careByProduct,careGoals,ingredientNotes,evidenceNote} from './care-content'

export function ProductCare({slug}) {
  const care=careByProduct[slug]
  return <section className="section care-detail" aria-label="Hautbedürfnisse und Pflegegefühl">
    <div className="care-detail-intro"><h2>Passt zu deiner Haut,<br/>wenn …</h2><ul>{care.needs.map(n=><li key={n}>{n}</li>)}</ul></div>
    <div className="care-detail-copy"><h2>So fühlt sich die Pflege an</h2><p>{care.feeling}</p><h3>Die Wirkstoffe dahinter</h3><p>{care.focus}</p>{slug==='contour-eye-cream'&&<p className="care-note">Im Coaching heißt die Kombination aus Palmitoyl Tripeptide-1 und Palmitoyl Tetrapeptide-7 „Matrixyl-3000-Logik“. Die Produktangaben nennen die beiden Peptide einzeln.</p>}</div>
    <p className="care-evidence">{evidenceNote}</p>
  </section>
}

export function CareEntry(){return <section className="section care-entry"><div className="section-heading"><h2>Was braucht deine Haut?</h2><Link className="text-link" href="/science/">Pflegeziele verstehen</Link></div><div className="care-entry-grid">{[products[1],products[0],products[2]].map(p=><article key={p.slug}><h3>{p.short}</h3><p>{careByProduct[p.slug].short}</p><Link className="text-link" href={`/products/${p.slug}/`}>Pflege entdecken</Link></article>)}</div></section>}

export function CareKnowledge(){return <>
  <section className="section care-knowledge"><h2>Sechs Pflegeziele.<br/>Eine durchdachte Routine.</h2><div className="care-goal-grid">{careGoals.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><p className="care-evidence">{evidenceNote}</p></section>
  <section className="section care-ingredients"><h2>Wirkstoffnamen verständlich erklärt</h2><div className="care-ingredient-list">{ingredientNotes.map(([title,body])=><details key={title}><summary>{title}</summary><p>{body}</p></details>)}</div><p className="care-note">Die Wirkstoffschwerpunkte ersetzen keine vollständige INCI-Liste. Diese folgt vor der Bestellfreigabe.</p><Link className="text-link" href="/routine/">Die Anwendung kennenlernen</Link></section>
  </>}

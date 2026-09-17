import Link from 'next/link'
import {RoutineSet} from './storefront'
import {ritualSet} from './catalog'
import './ritual-set.css'
const steps=[['01','Balance Prepeptide Toner','Vorbereiten','100 ml'],['02','GHK-Cu Renewal Serum','Pflegen','30 ml'],['03','Contour Lift Eye Cream','Ergänzen','15 ml']]
export default function RitualSet(){return <section className="ritual-set-feature" aria-label="Das komplette ELYSERA Set">
  <Link href="/products/peptide-ritual-set" className="ritual-set-photo"><img src={ritualSet.image} width="1440" height="1920" alt="Die drei ELYSERA Pflegeprodukte in Navy und Gold auf dunklem Naturstein" loading="eager"/><span className="ritual-set-image-label">ELYSERA · THE COMPLETE RITUAL</span></Link>
  <div className="ritual-set-copy"><span className="ritual-set-eyebrow">DIE KOMPLETTE PFLEGEROUTINE</span><h2>The Peptide<br/>Ritual Set</h2><p className="ritual-set-intro">Drei Schritte. Ein Moment für dich.<br/>Deine tägliche Peptidpflege, vereint in einem Set.</p>
  <ol className="ritual-set-contents">{steps.map(([number,name,role,volume])=><li key={number}><span className="ritual-set-step">{number}</span><div><span className="ritual-set-role">{role}</span><span className="ritual-set-name">{name}</span></div><span className="ritual-set-volume">{volume}</span></li>)}</ol>
  <div className="ritual-set-purchase"><div className="ritual-set-price"><strong>139 €</strong><span><s>157 €</s> bei Einzelkauf</span><span className="ritual-set-saving">18 € Set-Vorteil</span></div><RoutineSet label="DAS SET AUSWÄHLEN"/><p className="ritual-set-note">Presale ab 23.09.2026 · Versandkosten vor dem Kauf</p></div>
  <Link className="ritual-set-details" href="/products/peptide-ritual-set">Das Ritual entdecken <span aria-hidden="true">↗</span></Link></div>
</section>}

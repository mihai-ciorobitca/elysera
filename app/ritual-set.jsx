import Link from 'next/link'
import {RoutineSet} from './storefront'
import {ritualSet} from './catalog'
import './ritual-set.css'
const steps=[['01','Balance Prepeptide Toner','Vorbereiten','100 ml','toner'],['02','GHK-Cu Renewal Serum','Pflegen','30 ml','serum'],['03','Contour Lift Eye Cream','Ergänzen','15 ml','eye']]
export default function RitualSet(){return <section className="ritual-set-feature" aria-label="Das komplette ELYSERA Set">
  <Link href="/products/peptide-ritual-set" className="ritual-set-photo"><img src={ritualSet.image} width="1440" height="1920" alt="Die drei ELYSERA Pflegeprodukte in Navy und Gold auf dunklem Naturstein" loading="eager"/><span className="ritual-set-image-label">ELYSERA · THE COMPLETE RITUAL</span></Link>
  <div className="ritual-set-copy"><span className="ritual-set-eyebrow">DIE KOMPLETTE PFLEGEROUTINE</span><h2>The Peptide<br/>Ritual Set</h2><p className="ritual-set-intro">Drei Schritte. Ein Moment für dich.<br/>Deine tägliche Peptidpflege, vereint in einem Set.</p>
  <ol className="ritual-set-contents">{steps.map(([number,name,role,volume,image])=><li key={number}><div className="ritual-set-product"><span className="ritual-set-step">{number}</span><img src={`/media/atelier-2026/${image}.webp`} alt={name} width="60" height="76" loading="lazy"/></div><div><span className="ritual-set-role">{role}</span><span className="ritual-set-name">{name}</span></div><span className="ritual-set-volume">{volume}</span></li>)}</ol>
  <div className="ritual-set-purchase"><div className="ritual-set-price"><strong>139 €</strong><span><s>157 €</s> bei Einzelkauf</span><span className="ritual-set-saving">18 € Set-Vorteil</span></div><RoutineSet label="SET IN DEN WARENKORB"/><p className="ritual-set-note">Unverbindlich im Warenkorb speichern · Checkout noch nicht verfügbar</p></div>
  <Link className="ritual-set-details" href="/products/peptide-ritual-set">Das Ritual entdecken <span aria-hidden="true">↗</span></Link></div>
</section>}

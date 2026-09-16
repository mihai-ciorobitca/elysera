import Link from 'next/link'
import {RoutineSet} from './storefront'
import './ritual-set.css'
import {ritualSet} from './catalog'
export default function RitualSet(){return <section className="ritual-set-feature" aria-label="Das komplette ELYSERA Set"><Link href="/products/peptide-ritual-set" className="ritual-set-photo"><img src={ritualSet.image} alt="ELYSERA Set mit Balance Prepeptide Toner, GHK-Cu Renewal Serum und Contour Lift Eye Cream"/></Link><div><span className="lp-kicker">DIE KOMPLETTE ROUTINE · UNSERE EMPFEHLUNG</span><h2>The Peptide Ritual Set</h2><p>Drei Schritte, die zusammengehören. Balance Prepeptide Toner (100 ml), GHK-Cu Renewal Serum (30 ml) und Contour Lift Eye Cream (15 ml).</p><p className="ritual-set-price"><strong>139 €</strong> <span>statt 157 € bei Einzelkauf · 18 € sparen</span></p><p>Presale ab 23.09.2026 · Versandkosten vor dem Kauf</p><RoutineSet/><Link className="lp-underlink" href="/products/peptide-ritual-set">DAS SET ENTDECKEN</Link></div></section>}

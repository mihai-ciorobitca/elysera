import {pageMetadata} from '../../../lib/seo.mjs'
import RitualSet from '../../ritual-set'
import Link from 'next/link'
export const metadata=pageMetadata('The Peptide Ritual Set','Die komplette ELYSERA Routine: Balance Prepeptide Toner, Renewal Serum und Contour Lift Eye Cream in einem Set.','/products/peptide-ritual-set','/media/atelier-2026/collection.webp')
export default function SetPage(){return <section className="section"><h1>Deine komplette ELYSERA Routine</h1><RitualSet/><h2>Anwendung & Lieferung</h2><p>Nach der Reinigung den Toner aufsprühen, anschließend das Serum auftragen und zum Abschluss die Augencreme sanft einklopfen.</p><p>Die Auslieferung des Serums ist für Mitte Oktober 2026 geplant. Die Liefertermine für Toner, Augencreme und das vollständige Set werden vor Bestellstart bekannt gegeben.</p><Link className="text-link" href="/presale">PRESALE & LIEFERUNG →</Link></section>}

import RitualSet from '../../ritual-set'
import Link from 'next/link'
export const metadata={title:'The Peptide Ritual Set · 139 €'}
export default function SetPage(){return <section className="section"><h1>Deine komplette ELYSERA Routine</h1><RitualSet/><h2>Anwendung & Lieferung</h2><p>Nach der Reinigung den Toner aufsprühen, anschließend das Serum auftragen und zum Abschluss die Augencreme sanft einklopfen.</p><p>Die Auslieferung des Serums ist für Mitte Oktober 2026 geplant. Die Liefertermine für Toner, Augencreme und das vollständige Set werden vor Bestellstart bekannt gegeben.</p><Link className="text-link" href="/presale">PRESALE & LIEFERUNG →</Link></section>}

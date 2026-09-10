import Link from 'next/link'
import FounderSection from './founder-section'
import {EditorialDiscover} from './design-details'
import {products} from './catalog'
import {ProductCard,FAQ,RoutineSet} from './storefront'
import {CampaignMotion,TextureLibrary} from './campaign'
import {RoutineExperience} from './experience'
import PortraitLoop from './portrait-loop'
import ReferenceHero from './reference-hero'
import ReferenceBenefits from './reference-benefits'
import AutoCarousel from './auto-carousel'

const steps = [
 {title:'Vorbereiten',image:'toner',copy:'Ein frischer Anfang nach der Reinigung.',slug:'balance-toner'},
 {title:'Pflegen',image:'serum',copy:'Dein täglicher Peptidschritt mit Renewal Serum.',slug:'renewal-serum'},
 {title:'Gezielt ergänzen',image:'eye',copy:'Besondere Pflege für deine Augenpartie.',slug:'contour-eye-cream'},
]
export default function Home(){return <div className="reference-home">
 <ReferenceHero/>
 <ReferenceBenefits/>
 <section className="section collection-section" id="collection">
  <div className="section-heading"><h2>Die Elysera Kollektion</h2></div>
  <AutoCarousel className="product-grid" label="Produkt" delay={4000}>{products.map(p=><ProductCard key={p.slug} product={p}/>)}</AutoCarousel>
 </section>
 <section className="ritual-intro">
  <h2>Deine Pflege beginnt hier</h2><p>Drei aufeinander abgestimmte Schritte für deine tägliche Routine.</p>
  <AutoCarousel className="reference-mosaic routine-mosaic" label="Pflegeschritt">{steps.map(s=><Link href={`/products/${s.slug}/`} className="reference-mosaic-card" key={s.slug}><CampaignMotion name={s.image} alt=""/><div className="reference-mosaic-copy"><h3>{s.title}</h3><p>{s.copy}</p><span className="text-link">Produkt entdecken</span></div></Link>)}</AutoCarousel>
 </section>
 <section className="finder-editorial reference-quiz-banner" id="pflege-finder">
  <CampaignMotion name="toner-texture" alt="Illustrative Textur der Elysera Pflege"/>
  <div className="editorial-copy"><h2>Finde die Pflege,<br/>die zu deiner Haut passt</h2><p>Noch nicht sicher, womit du starten möchtest? Drei kurze Fragen führen dich zu deinem Einstieg in die Kollektion.</p><Link className="button" href="/quiz/">Pflege-Quiz starten</Link><Link className="text-link" href="/shop/">Oder alle Produkte entdecken</Link></div>
 </section>
 <section className="section care-section science-editorial">
  <div className="section-heading"><span className="eyebrow">WIRKSTOFFE & TEXTUREN</span><h2>Pflege im Detail</h2></div>
  <AutoCarousel className="reference-mosaic science-mosaic" label="Pflegewissen">{[
   ['Peptidpflege','serum-texture','Entdecke GHK-Cu und die Wirkstofflogik des Renewal Serums.'],
   ['Leichte Feuchtigkeit','toner-texture','Feiner Sprühnebel als erster Schritt nach der Reinigung.'],
   ['Gezielte Augenpflege','eye-texture','Peptide, Koffein und Squalan für deine Augenpartie.'],
  ].map(([title,image,copy])=><Link className="reference-mosaic-card" href="/science/" key={title}><CampaignMotion name={image} alt=""/><div className="reference-mosaic-copy"><h3>{title}</h3><p>{copy}</p><span className="text-link">Mehr erfahren</span></div></Link>)}</AutoCarousel>
 </section>
 <TextureLibrary/>
 <section className="ugc-journal" id="pflege-alltag">
  <div className="ugc-journal-heading"><h2>Pflege im echten Leben</h2><p>Entdecke die Anwendung von Elysera.</p></div>
  <AutoCarousel className="ugc-journal-grid" label="Anwendung" delay={4000}>{[
   ['ugc-creator','UGC-Model zeigt das Elysera Renewal Serum im Badezimmer','Renewal Serum','renewal-serum'],
   ['ugc-morning','Illustrative Pflegeroutine mit Balance Toner','Balance Toner','balance-toner'],
   ['ugc-eye','Illustrative Anwendung der Augenpflege','Contour Eye Cream','contour-eye-cream'],
  ].map(([image,alt,title,slug])=><figure key={slug}><CampaignMotion name={image} alt={alt}/><figcaption><Link className="text-link" href={`/products/${slug}/`}>{title} entdecken</Link></figcaption></figure>)}</AutoCarousel>
  <p className="ugc-journal-note">KI-generierte Anwendungsszenen · keine Kundenbewertungen.</p>
 </section>
 <RoutineExperience compact/>
 <section className="routine-actions-band" aria-label="Gesamte Pflegeroutine auswählen"><div className="routine-actions"><RoutineSet/></div></section>
 <section className="skin-story" id="hautpflege-story"><div className="skin-story-image"><PortraitLoop name="story-serum" alt="Frau verteilt ELYSERA Renewal Serum sanft auf ihrer Wange"/></div><div className="skin-story-copy editorial-copy"><h2>Pflege, die bei<br/>deiner Haut beginnt</h2><p>ELYSERA verbindet gezielte Peptidpflege mit drei klaren Aufgaben – vom frischen Anfang bis zur Augenpartie.</p><Link className="button" href="/about/">Lerne Elysera kennen</Link></div></section>
 <FounderSection/>
 <FounderSection person="jessica"/>
 <EditorialDiscover/>
 <section className="section home-faq"><div><h2>Gut zu wissen</h2><Link className="text-link" href="/faq/">Alle Fragen</Link></div><FAQ limit={4}/></section>
 <section className="presale-close presale-finale"><div className="presale-finale-art"><CampaignMotion name="hero-mobile" alt="Die drei ELYSERA Pflegeprodukte in Nachtblau und Gold"/></div><div className="presale-finale-copy"><span className="eyebrow">PRESALE · AB 23.09.2026</span><h2>Deine Routine.<br/><span>Dein erster Schritt.</span></h2><p>Drei aufeinander abgestimmte Pflegeprodukte.<br/>Entdecke die erste ELYSERA Kollektion.</p><div className="presale-finale-price"><span>DAS 3ER-SET</span><strong>139 €</strong><small>Renewal Serum einzeln · 59 €</small></div><Link className="button" href="/shop/">KOLLEKTION ENTDECKEN <span aria-hidden="true">→</span></Link><Link className="button" href="/account/">Kostenlos vorregistrieren</Link><Link className="text-link" href="/presale/">Presale & Lieferung</Link></div></section>
</div>}

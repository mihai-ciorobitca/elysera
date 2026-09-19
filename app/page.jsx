import SplitVideo from './split-video'
import RitualSet from './ritual-set'
import HeroVideo from './hero-video'
import {mediaSrcSet} from './media-library'
import Link from 'next/link'
import {products} from './catalog'
import {ProductShelf,FAQ} from './storefront'
function Heading({kicker,title,copy,href,label}){return <div className="lp-heading">{kicker&&<span className="lp-kicker">{kicker}</span>}<h2>{title}</h2>{copy&&<p>{copy}</p>}{href&&<Link className="lp-button" href={href}>{label||'ENTDECKEN'}</Link>}</div>}
function Split({image,video,alt,kicker,title,copy,href,label,reverse=false,pale=false,position}){return <section className={`lp-split${/toner-application-luxury|eye-cream-application-luxury|portrait-ceo-crossed-arms/.test(image)?' lp-portrait-split':''}${reverse?' lp-reverse':''}${pale?' lp-pale':''}`}><div className="lp-split-image">{video?<SplitVideo src={video} poster={image} alt={alt}/>:<img src={image} srcSet={image.includes('-20260912.webp')?mediaSrcSet(image.split('/').pop().replace('.webp','')):undefined} sizes="(max-width:700px) 100vw, 50vw" alt={alt} loading="lazy" decoding="async" style={position?{objectPosition:position}:undefined}/>}</div><div className="lp-split-copy"><span className="lp-kicker">{kicker}</span><h2>{title}</h2><p>{copy}</p><Link href={href} className="lp-button">{label||'MEHR ENTDECKEN'}</Link></div></section>}
export default function Home(){return <div className="lp-home lp-home-structured">
 <section className="lp-hero lp-hero-blue"><HeroVideo/><div className="lp-hero-copy"><span className="lp-kicker">DIE ERSTE KOLLEKTION</span><h1>DEIN TÄGLICHES<br/>RITUAL.<br/>NEU DEFINIERT.</h1><p>ENTDECKE DIE WELT DER PEPTIDPFLEGE</p><Link className="lp-button lp-button-white" href="/shop">DIE KOLLEKTION</Link></div></section>
 <section className="lp-collection" id="collection"><Heading title="DREI SCHRITTE. EIN PFLEGERITUAL." href="/shop" label="DIE KOLLEKTION ENTDECKEN"/><ProductShelf items={[products[1],products[0],products[2]]}/></section>
 <section className="lp-split lp-reverse lp-pale lp-ritual-panel" id="pflegeritual"><div className="lp-split-image"><img src="/media/ritual-three-steps-v3.webp" width="1120" height="1400" alt="Toner als feiner Sprühnebel, hellblaues Serum auf der Haut und sanft aufgetragene Augencreme" loading="lazy" decoding="async"/><ol className="lp-ritual-labels">{['Vorbereiten','Pflegen','Ergänzen'].map((step,i)=><li key={step}><span>0{i+1}</span><strong>{step}</strong></li>)}</ol></div><div className="lp-split-copy"><h2>DEINE HAUT.<br/>DEINE ROUTINE.</h2><p>Jede Pflegeroutine beginnt mit deinen Bedürfnissen. Zwei kurze Fragen helfen dir, deinen Einstieg in die ELYSERA Kollektion zu finden.</p><Link href="/quiz" className="lp-button">DEINE PFLEGE FINDEN</Link></div></section>
 <section className="lp-feature"><Heading title="DIE WISSENSCHAFT DER PFLEGE"/><Split image="/media/science-formulation-lab.webp" alt="Illustrative Laborszene mit zwei Forschenden an einer Formulierungsanlage" kicker="DAS ELYSERA WIRKSTOFFKONZEPT" title={<>PEPTIDE.<br/>BEWUSST KOMBINIERT.</>} copy="GHK-Cu, Hyaluron, Niacinamid und Ectoin: Lerne die Wirkstoffschwerpunkte unserer Kollektion kennen und verstehe, wie sich die drei Pflegeschritte ergänzen." href="/science" label="PEPTIDWISSEN ENTDECKEN" pale/></section>
 <div className="lp-home-set"><RitualSet/><Link href="/presale" className="lp-underlink">PRESALE AB 23.09.2026 · LIEFERUNG & DETAILS</Link></div>
 <section className="lp-founders" aria-labelledby="home-founders-title">
  <div className="lp-heading"><h2 id="home-founders-title">DIE MENSCHEN HINTER ELYSERA</h2><p>Hautpraxis trifft Pflegekonzept.</p></div>
  <div className="lp-founders-grid">
   <article><img src="/media/bettina/portrait-confident.webp" width="1122" height="1402" alt="Bettina Mattheus, Mitgründerin von ELYSERA" loading="lazy" decoding="async"/><div><h3>Bettina Mattheus</h3><p>Mehr als 25 Jahre Hautpraxis prägen Bettina Mattheus’ Blick auf Pflege.</p><Link className="lp-underlink" href="/about#bettina-mattheus">BETTINA KENNENLERNEN</Link></div></article>
   <article><img src="/media/jessica/portrait-confident-1122.webp" width="1122" height="1402" alt="Jessica Winterholler, Mitgründerin von ELYSERA" loading="lazy" decoding="async"/><div><h3>Jessica Winterholler</h3><p>Jessica steht hinter der Idee und Vision von ELYSERA und verantwortet die Markenentwicklung.</p><Link className="lp-underlink" href="/about#jessica-winterholler">JESSICA KENNENLERNEN</Link></div></article>
  </div>
 </section>
 <section className="lp-faq"><Heading title="DEINE FRAGEN. UNSERE ANTWORTEN."/><FAQ limit={4}/><Link className="lp-underlink" href="/faq">ALLE FRAGEN ANSEHEN</Link></section>
 </div>}

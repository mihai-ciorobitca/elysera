'use client'
import Link from 'next/link'
import {createContext,useContext,useEffect,useRef,useState} from 'react'
import {usePathname} from 'next/navigation'
import {products as catalogProducts,faqs,presalePriceLabel,prices,ritualSet} from './catalog'
import DynamicFAQ from './dynamic-faq'
import {Gallery,CampaignImage,CampaignMotion,TextureLibrary} from './campaign'
import CheckoutPreview from './checkout'
import Navigation from './navigation'
import PrairieFooter from './prairie-footer'
import ProductCard from './product-card'
import ShopCollection from './shop-collection'
import {MerchandisingProvider} from './product-merchandising-context'
export {ProductCard,ShopCollection}
import './product-content.css'
const Cart=createContext(null)
const PublishedCatalog=createContext(null)
export const usePublishedCatalog=()=>useContext(PublishedCatalog)
export function ProductPrice({slug,featured=false}){return featured?<span className="featured-price"><strong>{prices[slug]} €</strong><span className="featured-price-context">{slug==='peptide-ritual-set'?'Preis für das komplette 3er-Set':'Einzelpreis'}</span><span className="featured-price-date">Presale ab 23.09.2026</span></span>:<span>{presalePriceLabel(slug)} · Ab 23.09.2026</span>}
export function Icon({name}){const paths={bag:<><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>,search:<><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></>,user:<><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></>,menu:<path d="M3 6h18M3 12h18M3 18h18"/>,close:<path d="m5 5 14 14M5 19 19 5"/>,arrow:<path d="M3 12h18m-7-7 7 7-7 7"/>};return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{paths[name]||paths.arrow}</svg>}
const navLinks=[['/','Home'],['/presale/','Presale & Lieferung'],['/account/','Mein Konto'],['/shop/','Shop'],['/routine/','Die Routine'],['/quiz/','Pflege-Quiz'],['/science/','Peptidwissen'],['/about/','Über ELYSERA'],['/faq/','Fragen & Antworten'],['/contact/','Kontakt & Hilfe']]
export function Shell({children}){
 const pathname=usePathname(),[contentState,setContentState]=useState({path:null,products:null})
 const contentProducts=contentState.path===pathname?contentState.products:null,products=[...(contentProducts||catalogProducts),ritualSet]
 useEffect(()=>{const controller=new AbortController();fetch("/api/product-content",{cache:"no-store",signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(Array.isArray(data.products)&&data.products.length===catalogProducts.length)setContentState({path:pathname,products:data.products})}).catch(()=>{});return()=>controller.abort()},[pathname])
 const [liveProducts,setLiveProducts]=useState([])
 useEffect(()=>{fetch('/api/products',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>setLiveProducts(data.products)).catch(()=>{})},[])
 const [cart,setCart]=useState({}),[ready,setReady]=useState(false),[panel,setPanel]=useState(null),[query,setQuery]=useState('')
 const dialog=useRef(null)
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('elysera-selection')||'{}');setCart(Object.fromEntries(products.filter(p=>Number.isInteger(saved[p.slug])&&saved[p.slug]>0).map(p=>[p.slug,Math.min(12,saved[p.slug])])))}catch{}setReady(true)},[])
 useEffect(()=>{if(ready)try{localStorage.setItem('elysera-selection',JSON.stringify(cart))}catch{}},[cart,ready])
 useEffect(()=>{setPanel(null)},[pathname])
 useEffect(()=>{if(panel){dialog.current?.showModal();dialog.current?.querySelector('button')?.focus();document.body.style.overflow='hidden'}else{dialog.current?.close();document.body.style.overflow=''}return()=>{document.body.style.overflow=''}},[panel])
 const count=Object.values(cart).reduce((a,b)=>a+b,0)
 const change=(slug,quantity)=>setCart(c=>{const next={...c};if(quantity<1)delete next[slug];else next[slug]=Math.min(12,quantity);return next})
 const add=(slug,quantity=1)=>{setCart(c=>({...c,[slug]:Math.min(12,(c[slug]||0)+quantity)}));setPanel('cart')}
 const addRoutine=()=>add(ritualSet.slug)
 const matches=products.filter(p=>`${p.name} ${p.ingredients.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))
 if(pathname.startsWith('/dashboard')||pathname.startsWith('/auth/')||pathname==='/admin'||pathname.startsWith('/admin/')||pathname.startsWith('/admin-preview')) return <>{children}</>
 return <MerchandisingProvider><PublishedCatalog.Provider value={contentProducts}><Cart.Provider value={{cart,change,add,addRoutine,count,ready,liveProducts,catalogProducts:products}}>
 <a className="skip" href="#main">Zum Inhalt</a>
 <Navigation count={count} openPanel={setPanel} products={products}/>
 <main id="main" data-store-ready={ready} data-page={pathname==='/'?'home':'inner'}>{children}</main>
 <PrairieFooter products={products}/>
 <dialog ref={dialog} className="drawer" onKeyDownCapture={e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();setPanel(null)}}} onCancel={()=>setPanel(null)} onClick={e=>{if(e.target===dialog.current)setPanel(null)}} aria-labelledby="panel-title" onKeyDown={e=>{if(e.key!=='Tab')return;const items=[...e.currentTarget.querySelectorAll('button:not(:disabled),a[href],input')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}}>
 <div className="drawer-inner"><div className="drawer-head"><h2 id="panel-title">{panel==='cart'?'DEINE AUSWAHL':panel==='search'?'PRODUKTE SUCHEN':'ENTDECKE ELYSERA'}</h2><button className="icon-button" autoFocus aria-label="Schließen" onClick={()=>setPanel(null)}><Icon name="close"/></button></div>
 {(panel==='menu'||panel==='discover')&&<nav className="mobile-links">{navLinks.map(([href,label])=><Link key={href} href={href} onClick={()=>setPanel(null)}>{label}<Icon/></Link>)}</nav>}
 {panel==='search'&&<><label className="eyebrow" htmlFor="product-search">PRODUKT ODER WIRKSTOFF</label><input id="product-search" className="search-input" type="search" placeholder="Zum Beispiel Serum oder Ectoin" value={query} onChange={e=>setQuery(e.target.value)}/><div aria-live="polite"><p className="result-count">{matches.length} {matches.length===1?'Produkt':'Produkte'} gefunden</p>{matches.map(p=><Link className="mini-product" href={`/products/${p.slug}/`} key={p.slug} onClick={()=>setPanel(null)}><img src={p.slug===ritualSet.slug?p.image:`/media/atelier-2026/${p.step==='01'?'toner':p.step==='02'?'serum':'eye'}.webp`} alt=""/><div><h3>{p.name}</h3><p>{p.volume} · Presale</p></div><Icon/></Link>)}{!matches.length&&<p className="empty">Keine Produkte gefunden. Suche nach Serum, Toner oder Eye Cream.</p>}</div></>}
 {panel==='cart'&&<>{!count?<div className="empty"><Icon name="bag"/><h3>DEINE ROUTINE WARTET AUF DICH.</h3><p>Deine Auswahl ist noch leer. Entdecke das Set und die drei Pflegeprodukte.</p><Link className="button" href="/shop/" onClick={()=>setPanel(null)}>ZUM SHOP <Icon/></Link></div>:<><p className="muted">Auf diesem Gerät gespeichert. Noch keine Bestellung.</p>{products.filter(p=>cart[p.slug]).map(p=><div className="cart-product" key={p.slug}><img src={p.slug===ritualSet.slug?p.image:`/media/atelier-2026/${p.step==='01'?'toner':p.step==='02'?'serum':'eye'}.webp`} alt={p.name}/><div><Link href={`/products/${p.slug}/`} onClick={()=>setPanel(null)}>{p.name}</Link><p>{p.volume} · <ProductPrice slug={p.slug}/></p><div className="quantity"><button aria-label={`${p.short}: Menge verringern`} onClick={()=>change(p.slug,cart[p.slug]-1)}>−</button><output aria-label="Menge">{cart[p.slug]}</output><button disabled={cart[p.slug]>=12} aria-label={`${p.short}: Menge erhöhen`} onClick={()=>change(p.slug,cart[p.slug]+1)}>+</button></div><button className="remove" onClick={()=>change(p.slug,0)}>Entfernen</button></div></div>)}<div className="cart-bottom"><p>Presale ab 23.09.2026 · 3er-Set 139 € · Serum 69 € · Toner 29 € · Eye Cream 59 €.</p><Link className="button" href="/checkout/" onClick={()=>setPanel(null)}>ZUR ÜBERSICHT <Icon/></Link><button className="text-link" onClick={()=>setPanel(null)}>WEITER ENTDECKEN</button></div></>}</>}
 </div></dialog></Cart.Provider></PublishedCatalog.Provider></MerchandisingProvider>
}
export function AddButton({slug,quantity=1,compact=false}){const {add,ready}=useContext(Cart);return <button className={`button ${compact?'outline':''}`} disabled={!ready} onClick={()=>add(slug,quantity)}>{compact?'AUSWÄHLEN':'FÜR DEN PRESALE AUSWÄHLEN'}<Icon name="bag"/></button>}
export function FAQ({limit}){return <DynamicFAQ limit={limit}/>}
export function ProductShelf({items}){const ref=useRef(null);const [index,setIndex]=useState(0);const move=direction=>{const el=ref.current;const next=Math.max(0,Math.min(items.length-1,index+direction));el?.children[next]?.scrollIntoView({behavior:'instant',block:'nearest',inline:'start'});setIndex(next)};return <div className="product-shelf"><div ref={ref} className="lp-product-grid" onScroll={()=>{const el=ref.current;if(el?.children[0])setIndex(Math.min(items.length-1,Math.round(el.scrollLeft/(el.children[0].getBoundingClientRect().width+20))))}}>{items.map(p=><ProductCard product={p} key={p.slug}/>)}</div><div className="shelf-controls" aria-label="Produkte durchblättern"><button aria-label="Vorheriges Produkt" disabled={index===0} onClick={()=>move(-1)}>←</button><span aria-live="polite">{index+1} / {items.length} · DIE KOLLEKTION</span><button aria-label="Nächstes Produkt" disabled={index===items.length-1} onClick={()=>move(1)}>→</button></div></div>}
export function ProductGallery({product}){return <Gallery product={product}/>}
export function ProductPurchase({slug}){const [quantity,setQuantity]=useState(1);return <div className="purchase"><p className="price-pending">PRESALE <ProductPrice slug={slug}/></p><div className="purchase-actions"><div className="quantity"><button aria-label="Menge verringern" disabled={quantity===1} onClick={()=>setQuantity(q=>q-1)}>−</button><output aria-label="Menge">{quantity}</output><button aria-label="Menge erhöhen" disabled={quantity===12} onClick={()=>setQuantity(q=>q+1)}>+</button></div><AddButton slug={slug} quantity={quantity}/></div><small>Unverbindliche Auswahl · Noch keine Bestellung</small></div>}
export function Checkout(){const value=useContext(Cart);return <CheckoutPreview {...value}/>}
export function RoutineQuiz(){
 const products=usePublishedCatalog()||catalogProducts
 const [step,setStep]=useState(0),[answers,setAnswers]=useState([])
 const questionHeading=useRef(null),firstQuestion=useRef(true)
 useEffect(()=>{if(firstQuestion.current){firstQuestion.current=false;return}const heading=questionHeading.current;heading?.focus({preventScroll:true});if(heading&& (heading.getBoundingClientRect().top<0||heading.getBoundingClientRect().bottom>innerHeight-80))heading.scrollIntoView({block:'start',behavior:'instant'})},[step])
 const questions=[{title:'WAS STEHT FÜR DICH IM FOKUS?',options:['Feuchtigkeit & Vorbereitung','Gezielte Peptidpflege','Die Augenpartie']},{title:'WELCHE TEXTUR MAGST DU?',options:['Einen frischen Sprühnebel','Ein leichtes Serum','Eine geschmeidige Creme']},{title:'WIE MÖCHTEST DU STARTEN?',options:['Mit einem gezielten Produkt','Mit der gesamten Routine']}]
 const result=answers[2]===1?[products[1],products[0],products[2]]:[answers[0]===0?products[1]:answers[0]===1?products[0]:products[2]]
 const current=questions[step]
 return <section className="section quiz-section"><div className="page-heading"><h1>DEINE HAUT.<br/><em>DEINE ROUTINE.</em></h1><p>Drei kurze Fragen helfen dir, die Kollektion kennenzulernen.</p></div>{step<3?<div className="quiz-body"><div className="quiz-progress" aria-label={`Frage ${step+1} von 3`}>{questions.map((_,i)=><span key={i} className={i<=step?'active':''}/>)}</div><span className="eyebrow">FRAGE {step+1} VON 3</span><h2 ref={questionHeading} tabIndex={-1}>{current.title}</h2><div className="quiz-options">{current.options.map((option,i)=><button key={option} aria-pressed={answers[step]===i} onClick={()=>setAnswers(a=>{const next=[...a];next[step]=i;return next})}><span className="radio-dot"/>{option}<Icon/></button>)}</div><div className="quiz-navigation"><button className="text-link" disabled={step===0} onClick={()=>setStep(s=>s-1)}>← ZURÜCK</button><button className="button" disabled={answers[step]===undefined} onClick={()=>setStep(s=>s+1)}>{step===2?'MEINE ROUTINE ANSEHEN':'WEITER'}<Icon/></button></div></div>:<div className="quiz-result"><h2 ref={questionHeading} tabIndex={-1}>{result.length===3?'DEINE ROUTINE IN DREI SCHRITTEN':'DEIN EINSTIEG IN DIE PEPTIDPFLEGE'}</h2><p>{result.length===3?'Beginne mit dem Toner, ergänze das Serum und schließe mit der Augenpflege ab.':`Passend zu deinem Schwerpunkt: ${result[0].name}.`} {answers[1]!==answers[0]&&result.length===1?'Dein Pflegeschwerpunkt bestimmt die Auswahl; entdecke die Textur auf der Produktseite.':''}</p><div className={`product-grid ${result.length===1?'single-result':''}`}>{result.map(p=><ProductCard key={p.slug} product={p}/>)}</div><button className="text-link" onClick={()=>{setStep(0);setAnswers([])}}>QUIZ NEU STARTEN ↻</button></div>}<p className="source-note">Orientierung innerhalb der ELYSERA Kollektion. Deine Antworten werden nicht übertragen oder gespeichert.</p></section>
}
export function TextureFilms(){return <TextureLibrary/>}

export function RoutineSet({label="3ER-SET · 139 € AUSWÄHLEN"}){const {addRoutine,ready}=useContext(Cart);return <button className="button routine-set-button" disabled={!ready} onClick={addRoutine}><span>{label}</span><Icon name="bag"/></button>}

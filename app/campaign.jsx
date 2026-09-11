'use client'
import Link from 'next/link'
import {useAutoAdvance} from './auto-carousel'
import {useEffect,useRef,useState} from 'react'
import ScrollMedia from './scroll-media'
import {mediaRoot,mediaName,mediaImage,mediaVideo,mediaSrcSet} from './media-library'
export {mediaRoot}
export function CampaignImage({name,alt='',className='',priority=false,sizes='(max-width: 600px) 100vw, 50vw',animate=true}){
 if(['serum','toner','eye'].includes(name))return <img className={`lp-gallery-packshot ${className}`} src={`/media/atelier-2026/${name}.webp`} alt={alt} loading={priority?'eager':'lazy'} decoding="async"/>
 const picture=<img className={className} src={mediaImage(name)} srcSet={mediaSrcSet(name)} sizes={sizes} alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async"/>
 return animate&&sizes!=='90px'?<ScrollMedia name={name} source={mediaVideo(name)}>{picture}</ScrollMedia>:picture
}
export function CampaignMotion(props){return <CampaignImage {...props}/>}
export function Gallery({product:p}){
 const [index,setIndex]=useState(0),[open,setOpen]=useState(false)
 const modal=useRef(null),start=useRef(null),trigger=useRef(null)
 const key=p.step==='01'?'toner':p.step==='02'?'serum':'eye'
 const images=[{name:key,label:'Produkt',alt:`${p.name}, ${p.volume}`},{name:`${key}-texture`,label:'Textur',alt:`Illustrative Texturaufnahme: ${p.short}`},{name:`${key}-application`,label:'Anwendung',alt:`Illustrative Anwendung: ${p.short}`},{name:'hero-mobile',label:'Kollektion',alt:'Die drei ELYSERA Pflegeprodukte'}]
 const change=n=>setIndex(i=>(i+n+images.length)%images.length)
 useEffect(()=>{if(open){modal.current?.showModal();document.body.style.overflow='hidden'}else{modal.current?.close();document.body.style.overflow=''}return()=>{document.body.style.overflow=''}},[open])
 const close=()=>{modal.current?.close();setOpen(false);trigger.current?.focus({preventScroll:true})}
 const swipe=e=>{if(start.current!==null){const delta=e.changedTouches[0].clientX-start.current;if(Math.abs(delta)>45)change(delta<0?1:-1)}start.current=null}
 return <div className="product-gallery" onTouchStart={e=>{start.current=e.touches[0].clientX}} onTouchEnd={swipe}>
  <button ref={trigger} className="gallery-main" onClick={()=>setOpen(true)} aria-label={`${images[index].label} vergrößern`}><CampaignImage name={images[index].name} alt={images[index].alt} priority sizes="(max-width:600px) 100vw, 50vw"/><span className="badge">PRESALE</span><span className="zoom-label">VERGRÖSSERN <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/></svg></span></button>
  <div className="gallery-nav"><button className="icon-button" aria-label="Vorheriges Bild" onClick={()=>change(-1)}>←</button><span aria-live="polite">{images[index].label} <span className="muted">/ {index+1} von {images.length}</span></span><button className="icon-button" aria-label="Nächstes Bild" onClick={()=>change(1)}>→</button></div>
  <div className="gallery-thumbnails">{images.map((im,i)=><button key={im.name} aria-label={`${im.label} ansehen`} aria-pressed={index===i} onClick={()=>setIndex(i)}><CampaignImage name={im.name} alt="" sizes="90px"/></button>)}</div>
  <dialog ref={modal} className="image-lightbox" aria-label={`${p.short}: Bildergalerie`} onCancel={close} onClick={e=>{if(e.target===modal.current)close()}} onKeyDown={e=>{if(e.key==='ArrowRight')change(1);if(e.key==='ArrowLeft')change(-1)}}><div className="lightbox-inner"><button className="icon-button lightbox-close" aria-label="Vergrößerung schließen" onClick={close}>×</button><CampaignImage name={images[index].name} alt={images[index].alt} priority sizes="100vw"/><div className="gallery-nav"><button className="icon-button" aria-label="Vorheriges großes Bild" onClick={()=>change(-1)}>←</button><span aria-live="polite">{images[index].label} · {index+1} / 4</span><button className="icon-button" aria-label="Nächstes großes Bild" onClick={()=>change(1)}>→</button></div></div></dialog>
 </div>
}
export function TextureLibrary(){const ref=useRef(null);const [active,setActive]=useState('serum');useAutoAdvance(ref,()=>setActive(key=>({serum:'toner',toner:'eye',eye:'serum'}[key])),8000);const details={serum:['BLAU. LEICHT.\nVOLLER PEPTIDE.','Renewal Serum','GHK-Cu trifft auf Hyaluron, Niacinamid und Ectoin. Der zentrale Schritt deiner Peptidpflege.','renewal-serum'],toner:['EIN FRISCHER\nANFANG.','Balance Toner','Ein feiner Sprühnebel als erster Schritt nach der Reinigung. Leichte Feuchtigkeit, direkt auf deiner Haut.','balance-toner'],eye:['KLEINE MENGE.\nGEZIELTE PFLEGE.','Contour Eye Cream','Eine geschmeidige Textur mit Peptiden, Koffein und Squalan für die Augenpartie.','contour-eye-cream']};const d=details[active];return <section ref={ref} className="texture-stage"><div className="texture-visual"><CampaignMotion key={active} name={`${active}-texture`} alt={`Künstlerische Texturinszenierung: ${d[1]}`}/></div><div className="texture-copy"><div className="texture-tabs" role="group" aria-label="Textur auswählen">{Object.entries(details).map(([key,val])=><button key={key} aria-pressed={active===key} onClick={()=>setActive(key)}>{val[1]}</button>)}</div><div key={active} className="texture-description editorial-copy"><h2>{d[0].split('\n').map((line,i)=><span key={line}>{i===1?<em>{line}</em>:line}</span>)}</h2><p>{d[2]}</p><Link className="text-link" href={`/products/${d[3]}/`}>DAS PRODUKT ENTDECKEN <span aria-hidden="true">→</span></Link></div><small>Illustrative Texturinszenierung</small></div></section>}

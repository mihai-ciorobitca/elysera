'use client'
import {ProductCare} from './care-sections'
import ProductFeedback from './product-feedback'
import {ELYSERA_PRODUCTS} from '../lib/elysera-products'
import Link from 'next/link'
import {ProductGallery,ProductPurchase,ProductCard,usePublishedCatalog} from './storefront'
import {CampaignImage} from './campaign'
import AutoCarousel from './auto-carousel'
export default function ProductDetailView({product:initialProduct,initialProducts}){
 const published=usePublishedCatalog(),products=published||initialProducts
 const p=products.find(item=>item.slug===initialProduct.slug)||initialProduct,slug=p.slug
return <><section className="section product-detail"><div><nav className="breadcrumbs" aria-label="Brotkrumennavigation"><Link href="/">Home</Link><span>/</span><Link href="/shop/">Kollektion</Link><span>/</span><span>{p.short}</span></nav><ProductGallery product={p}/></div><div className="detail-copy"><span className="eyebrow">ELYSERA · SCHRITT {p.step} · PRESALE</span><h1>{p.name}</h1><p className="product-subtitle">{p.role}</p><div className="volume">{p.volume} <span>{p.format}</span></div><p>{p.description}</p><ProductPurchase slug={p.slug}/><div className="product-accordions"><details open><summary>Anwendung <span>+</span></summary><p>{p.use}</p></details><details><summary>Textur & Hautgefühl <span>+</span></summary><p>{p.texture}</p></details><details><summary>Wirkstoffschwerpunkte <span>+</span></summary><p>{p.ingredients.join(' · ')}</p><p>Dies ist keine vollständige INCI-Liste. Die vollständigen Inhaltsstoffe folgen vor dem Bestellstart.</p></details><details><summary>Presale & Lieferung <span>+</span></summary><p>{p.delivery} Verbindliche Angaben erhältst du vor dem Kauf.</p></details></div></div></section><ProductCare slug={p.slug}/><ProductFeedback productId={ELYSERA_PRODUCTS.find(item=>item.slug===p.slug)?.id}/><section className="section"><div className="section-heading"><h2>Ergänze deine Routine</h2><Link className="text-link" href="/routine/">Die Reihenfolge entdecken →</Link></div><AutoCarousel className="product-grid related" label="Ergänzende Produkte" delay={4000}>{products.filter(o=>o.slug!==slug).map(o=><ProductCard key={o.slug} product={o}/>)}</AutoCarousel></section></>}

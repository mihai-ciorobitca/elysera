'use client'
import Link from 'next/link'
import {products} from './catalog'

const peptikingUrl = process.env.NEXT_PUBLIC_PEPTIKING_URL || 'https://www.peptiking.com'

export default function Checkout({ cart = {}, liveProducts = [] }) {
  const selected = Object.entries(cart)
  const available = selected.length > 0 && selected.every(([slug, quantity]) => {
    const product = liveProducts.find((item) => item.slug === slug)
    return product && product.price > 0 && product.stock >= quantity
  })
  const handoff = encodeURIComponent(JSON.stringify(cart))

  return <section className="section checkout"><div className="page-heading">
    <h1>Deine Elysera<br/><em>Auswahl.</em></h1>
    <p>Prüfe Verfügbarkeit und Preise und nutze den gemeinsamen PeptiKing-Checkout.</p>
    {selected.length > 0 ? <div className="atelier-checkout-items">{selected.map(([slug, quantity]) => {
      const product = liveProducts.find((item) => item.slug === slug)
      const catalog=products.find(item=>item.slug===slug)
      return <article key={slug}><img src={catalog?.image} alt={catalog?.name||slug}/><div><h2>{catalog?.name||product?.name||slug}</h2><p>{catalog?.volume} · Menge {quantity}</p><span>{product ? `EUR ${(product.price*quantity).toFixed(2)}` : 'Noch nicht verfügbar'}</span></div></article>
    })}</div>:<div className="atelier-empty"><p>Deine Auswahl ist noch leer.</p><Link href="/shop/" className="button">Kollektion entdecken</Link></div>}
    <a className={`button${available ? '' : ' disabled'}`} aria-disabled={!available} href={available ? `${peptikingUrl}/elysera-checkout?selection=${handoff}` : undefined}>ZUM GEMEINSAMEN CHECKOUT →</a>
  </div></section>
}

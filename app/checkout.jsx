'use client'
import Link from 'next/link'
import {products,presale,presalePriceLabel} from './catalog'

const peptikingUrl = process.env.NEXT_PUBLIC_PEPTIKING_URL || 'https://www.peptiking.com'

export default function Checkout({ cart = {}, liveProducts = [] }) {
  const selected = Object.entries(cart)
  const available = selected.length > 0 && selected.every(([slug, quantity]) => {
    const product = liveProducts.find((item) => item.slug === slug)
    return product && product.price > 0 && product.stock >= quantity
  })
  const sets = Math.min(...products.map(p => cart[p.slug] || 0))
  const extraSerums = (cart['renewal-serum'] || 0) - sets
  const hasSetOnlyRemainder = ['balance-toner','contour-eye-cream'].some(slug => (cart[slug] || 0) > sets)
  const previewTotal = sets * presale.setPrice + extraSerums * presale.serumPrice
  const handoff = encodeURIComponent(JSON.stringify(cart))

  return <section className="section checkout"><div className="page-heading">
    <h1>Deine Elysera<br/><em>Auswahl.</em></h1>
    <p>Deine auf diesem Gerät gespeicherten Pflegeprodukte auf einen Blick. Der Presale startet am {presale.start}.</p>
    {selected.length > 0 ? <div className="atelier-checkout-items">{selected.map(([slug, quantity]) => {
      const product = liveProducts.find((item) => item.slug === slug)
      const catalog=products.find(item=>item.slug===slug)
      return <article key={slug}><img src={catalog?.image} alt={catalog?.name||slug}/><div><h2>{catalog?.name||product?.name||slug}</h2><p>{catalog?.volume} · Menge {quantity}</p><span>{product ? `EUR ${(product.price*quantity).toFixed(2)}` : presalePriceLabel(slug)}</span></div></article>
    })}</div>:<div className="atelier-empty"><p>Deine Auswahl ist noch leer.</p><Link href="/shop/" className="button">Kollektion entdecken</Link></div>}
    {selected.length > 0 && <div className="presale-selection-price"><p>Presale ab {presale.start}</p>{sets > 0 && <p>{sets} × 3er-Set · {sets * presale.setPrice} €</p>}{extraSerums > 0 && <p>{extraSerums} × Renewal Serum · {extraSerums * presale.serumPrice} €</p>}{hasSetOnlyRemainder ? <p>Toner und Eye Cream sind im Presale nur im vollständigen 3er-Set erhältlich.</p> : <p><strong>Presale-Produktgesamtpreis: {previewTotal} €</strong><br/>Versandkosten werden vor dem Kauf angezeigt.</p>}</div>}
    {selected.length > 0 && <>
      <Link href="/account/" className="button">FÜR DEN PRE-SALE VORREGISTRIEREN</Link>
      <Link className="text-link checkout-edit" href="/shop/">AUSWAHL ERGÄNZEN →</Link>
      {!available && <p className="checkout-availability">Deine Auswahl ist nur in diesem Browser gespeichert. Für eine Vormerkung in deinem Konto registriere dich kostenlos und bestätige dein Interesse bei PeptiKing.</p>}
      <a className={`button${available ? '' : ' disabled'}`} aria-disabled={!available} href={available ? `${peptikingUrl}/elysera-checkout?selection=${handoff}` : undefined}><span>ZUM GEMEINSAMEN CHECKOUT</span><span aria-hidden="true">→</span></a>
    </>}
  </div></section>
}

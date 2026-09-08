'use client'

const peptikingUrl = process.env.NEXT_PUBLIC_PEPTIKING_URL || 'https://www.peptiking.com'

export default function Checkout({ cart = {}, liveProducts = [] }) {
  const selected = Object.entries(cart)
  const available = selected.length > 0 && selected.every(([slug, quantity]) => {
    const product = liveProducts.find((item) => item.slug === slug)
    return product && product.price > 0 && product.stock >= quantity
  })
  const handoff = encodeURIComponent(JSON.stringify(cart))

  return <section className="section checkout"><div className="page-heading">
    <h1>DEINE ELYSERA<br/><em>AUSWAHL.</em></h1>
    <p>Prüfe Verfügbarkeit und Preise und nutze den gemeinsamen PeptiKing-Checkout.</p>
    {selected.length > 0 && <ul>{selected.map(([slug, quantity]) => {
      const product = liveProducts.find((item) => item.slug === slug)
      return <li key={slug}>{product?.name || slug} × {quantity}{product ? ` · EUR ${product.price.toFixed(2)}` : ' · Noch nicht verfügbar'}</li>
    })}</ul>}
    <a className={`button${available ? '' : ' disabled'}`} aria-disabled={!available} href={available ? `${peptikingUrl}/elysera-checkout?selection=${handoff}` : undefined}>ZUM GEMEINSAMEN CHECKOUT →</a>
  </div></section>
}

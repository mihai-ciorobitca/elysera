'use client'
export default function Error({reset}){return <section className="section"><h1>News gerade nicht verfügbar.</h1><p>Bitte versuche es gleich noch einmal.</p><button className="button" onClick={reset}>Erneut laden</button></section>}

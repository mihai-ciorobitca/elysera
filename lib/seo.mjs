export const siteUrl='https://www.elysera.org'
export const indexable=process.env.VERCEL_ENV?process.env.VERCEL_ENV==='production':process.env.NODE_ENV==='production'
export const defaultDescription='Entdecke ELYSERA Peptidpflege: Renewal Serum, Balance Prepeptide Toner und Contour Lift Eye Cream – drei Schritte für deine Pflegeroutine.'
export function pageMetadata(title,description,path,image='/media/wavespeed-4k/hero-desktop.webp',privatePage=false){const url=siteUrl+path;return {title,description,alternates:{canonical:url},robots:{index:indexable&&!privatePage,follow:!privatePage},openGraph:{type:'website',locale:'de_DE',siteName:'ELYSERA',title,description,url,images:[{url:new URL(image,siteUrl).href,alt:title}]},twitter:{card:'summary_large_image',title,description,images:[new URL(image,siteUrl).href]}}}
export function jsonLd(value){return JSON.stringify(value).replaceAll('<','\\u003c')}
export const publicPages={
 '/':['ELYSERA – Peptidpflege für deine tägliche Routine',defaultDescription],
 '/shop':['Die Peptid-Kollektion','Toner, Serum und Augencreme: Entdecke die ELYSERA Produkte und das komplette Peptide Ritual Set.'],
 '/routine':['Deine Pflegeroutine in drei Schritten','Vorbereiten, pflegen, ergänzen: So kombinierst du ELYSERA Toner, Renewal Serum und Augencreme in deiner täglichen Routine.'],
 '/science':['Peptidwissen und Wirkstoffkonzept','Lerne das ELYSERA Pflegekonzept mit Peptiden, Feuchtigkeit und aufeinander abgestimmten Texturen kennen.'],
 '/about':['Die Marke ELYSERA','Lerne die Menschen und die Idee hinter ELYSERA kennen: Hautpraxis, Pflegewissen und eine Routine für den Alltag.'],
 '/faq':['Fragen und Antworten zu ELYSERA','Antworten zu ELYSERA Produkten, Anwendung, Presale, Lieferung und deinem Konto.'],
 '/contact':['Kontakt und Hilfe','Kontakt zum ELYSERA Team und Hilfe zu Produkten, deinem Konto sowie bestehenden Bestellungen.'],
 '/presale':['Presale und Lieferung','Informationen zum ELYSERA Presale, zur unverbindlichen Vormerkung, zu Produktpreisen und geplanten Lieferungen.'],
 '/quiz':['Finde deine ELYSERA Pflege','Zwei kurze Fragen helfen dir, passende Produkte innerhalb der ELYSERA Peptid-Kollektion zu entdecken.'],
 '/news':['News von ELYSERA','Neuigkeiten aus der ELYSERA Welt: Kollektion, Marke und Pflegeroutine.'],
 '/impressum':['Impressum','Anbieterkennzeichnung und Kontaktdaten von ELYSERA.'],
 '/datenschutz':['Datenschutzerklärung','Informationen zum Datenschutz bei ELYSERA.'],
 '/agb':['Allgemeine Geschäftsbedingungen','Allgemeine Geschäftsbedingungen von ELYSERA.'],
 '/widerruf':['Widerrufsbelehrung','Informationen zum Widerruf bei ELYSERA.']}

import './site.css'
import './storefront-alignment.css'
import './editorial-refinement.css'
import ImpersonationBanner from './impersonation-banner'
import {CardMotion} from './motion'

import Shell from './route-shell'
import {siteUrl,indexable} from '../lib/seo.mjs'
import StructuredData from './structured-data'
export const metadata = {
  title: { default: 'ELYSERA — Die Kraft der Peptide', template: '%s | ELYSERA' },
  description: 'Drei Produkte. Eine durchdachte Routine. Entdecke die ELYSERA Peptidpflege: Renewal Serum, Balance Prepeptide Toner und Contour Lift Eye Cream.',
  metadataBase: new URL(siteUrl),
  robots: { index: indexable, follow: true },
}
export default function Layout({ children }) {
  return <html lang="de"><body className="prairie-site"><StructuredData data={{'@context':'https://schema.org','@type':'Organization',name:'ELYSERA',url:siteUrl}}/><StructuredData data={{'@context':'https://schema.org','@type':'WebSite',name:'ELYSERA',url:siteUrl,inLanguage:'de-DE'}}/><ImpersonationBanner/><Shell>{children}</Shell></body></html>
}

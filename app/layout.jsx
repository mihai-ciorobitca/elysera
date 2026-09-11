import './site.css'
import {CardMotion} from './motion'

import { Shell } from './storefront'
export const metadata = {
  title: { default: 'ELYSERA — Die Kraft der Peptide', template: '%s | ELYSERA' },
  description: 'Drei Produkte. Eine durchdachte Routine. Entdecke die ELYSERA Peptidpflege: Renewal Serum, Balance Prepeptide Toner und Contour Lift Eye Cream.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://elysera.vercel.app'),
  robots: { index: false, follow: false },
}
export default function Layout({ children }) {
  return <html lang="de"><body className="prairie-site"><Shell>{children}</Shell></body></html>
}

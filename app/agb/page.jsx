import {pageMetadata,publicPages} from '../../lib/seo.mjs'
import LegalPage from '../legal-page'
export const metadata=pageMetadata(...publicPages['/agb'],'/agb')
export default function Page(){return <LegalPage page="agb"/>}

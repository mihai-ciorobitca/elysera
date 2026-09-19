import {pageMetadata,publicPages} from '../../lib/seo.mjs'
import LegalPage from '../legal-page'
export const metadata=pageMetadata(...publicPages['/impressum'],'/impressum')
export default function Page(){return <LegalPage page="impressum"/>}

import {pageMetadata,publicPages} from '../../lib/seo.mjs'
import LegalPage from '../legal-page'
export const metadata=pageMetadata(...publicPages['/datenschutz'],'/datenschutz')
export default function Page(){return <LegalPage page="datenschutz"/>}

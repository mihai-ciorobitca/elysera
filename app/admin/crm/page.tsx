import { CrmPage } from '@/components/crm/CrmPage'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Lead management', robots: { index: false, follow: false } }
export default function Page() { return <CrmPage admin /> }

import { CrmPage } from '@/components/crm/CrmPage'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your lead workspace', robots: { index: false, follow: false } }
export default async function Page({ searchParams }: { searchParams: Promise<{ loginError?: string }> }) {
  const params = await searchParams
  return <CrmPage loginError={params.loginError === '1'} />
}

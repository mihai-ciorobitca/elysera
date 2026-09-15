import { NextRequest, NextResponse } from 'next/server'
import { currentAdmin, currentUser } from '@/lib/auth/server'
import { crmReturnPath, crmSignInPath } from '@/lib/crm-login'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const path = crmReturnPath(request.nextUrl.searchParams.get('returnTo'))
  try {
    const principal = path === '/admin/crm' ? await currentAdmin() : await currentUser()
    return NextResponse.redirect(new URL(principal ? path : crmSignInPath(path), request.url), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'Die Anmeldung ist vorübergehend nicht verfügbar.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}

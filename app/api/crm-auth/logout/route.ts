import { NextResponse } from 'next/server'
import { authClient } from '@/lib/auth/server'
import { isSameOriginMutation } from '@/lib/same-origin-request'
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  try {
    const client = await authClient()
    const { error } = await client.auth.signOut({ scope: 'local' })
    if (error) throw error
    const response = NextResponse.redirect(new URL('/auth/signin', request.url), 303)
    response.cookies.delete('elysera-crm-unlock')
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch { return NextResponse.json({ error: 'Please try signing out again.' }, { status: 503 }) }
}

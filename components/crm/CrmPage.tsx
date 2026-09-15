import { DiamondCrm } from './DiamondCrm'
import { CrmError, requireCrmAccess } from '@/lib/diamond-crm-server'
import s from './DiamondCrm.module.css'
export async function CrmPage({ admin = false }: { admin?: boolean; loginError?: boolean }) {
  let gate = ''; let error = ''; let signedIn = false
  try { await requireCrmAccess(admin); signedIn = true }
  catch (e) {
    gate = e instanceof CrmError && e.status === 423 ? 'password' : e instanceof CrmError && e.status === 401 ? 'signin' : 'denied'
    signedIn = e instanceof CrmError && e.status !== 401
    error = e instanceof CrmError && ![401,423].includes(e.status) ? e.message : e instanceof CrmError ? '' : 'CRM is temporarily unavailable. Please try again.'
  }
  return <div lang="en" className={s.portal}>
    <nav className={s.portalNav} aria-label="CRM navigation"><a className={s.brand} href="/">ELYSERA<span>SKINCARE</span></a><div><a href={admin ? '/admin' : '/dashboard'}>Back to {admin ? 'administration' : 'dashboard'}</a>{signedIn ? <form action="/api/crm-auth/logout" method="post"><button>Sign out</button></form> : <a href={`/api/crm-auth/start?returnTo=${admin ? '/admin/crm' : '/dashboard/crm'}`}>Sign in</a>}</div></nav>
    <DiamondCrm admin={admin} initialGate={gate} initialError={error} />
  </div>
}

import {cookies} from 'next/headers'
import {referralCookie} from '@/lib/auth/referral-policy.mjs'
import AccountForm from '../account-form'
import '../signin/signin.css'

export const dynamic='force-dynamic'
export const metadata={title:'ELYSERA · Dein Konto',robots:{index:false,follow:false},referrer:'no-referrer'}
export default async function Page(){return <AccountForm mode="register" initialReferral={(await cookies()).get(referralCookie)?.value||''}/>}

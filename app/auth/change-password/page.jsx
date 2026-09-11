import AccountForm from '../account-form'
import '../signin/signin.css'
import {currentUser} from '@/lib/auth/server'
import {redirect} from 'next/navigation'
export const dynamic='force-dynamic'
export const metadata={title:'ELYSERA · Dein Konto',robots:{index:false,follow:false},referrer:'no-referrer'}
export default async function Page(){if(!await currentUser())redirect('/auth/signin');return <AccountForm mode="password"/>}

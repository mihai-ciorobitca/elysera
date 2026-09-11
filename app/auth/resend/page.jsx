import AccountForm from '../account-form'
import '../signin/signin.css'

export const dynamic='force-dynamic'
export const metadata={title:'ELYSERA · Dein Konto',robots:{index:false,follow:false},referrer:'no-referrer'}
export default async function Page(){return <AccountForm mode="resend"/>}

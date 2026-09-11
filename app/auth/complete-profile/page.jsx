import {redirect} from 'next/navigation'
import Link from 'next/link'
import {currentUser} from '@/lib/auth/server'
import {accountProfile} from '@/lib/auth/details-store'
import ProfileDetails from '../profile-details'
import '../signin/signin.css'
export const dynamic='force-dynamic'
export default async function Page(){const user=await currentUser();if(!user)redirect('/auth/signin');return <main className="es-login"><Link href="/" className="es-logo">ELYSERA</Link><section className="es-complete es-login-form"><h1>Dein Profil vervollständigen.</h1><ProfileDetails initialProfile={await accountProfile(user)} complete/><Link href="/">Zur Startseite</Link></section></main>}

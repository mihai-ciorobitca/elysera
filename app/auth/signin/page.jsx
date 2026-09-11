import {redirect} from 'next/navigation'
import {currentUser,authClient} from '@/lib/auth/server'
import {googleErrors} from '@/lib/auth/google-policy.mjs'
import SignIn from './signin'
import './signin.css'
export const metadata={title:'Anmelden'}
export const dynamic='force-dynamic'
export default async function Page({searchParams}){let user,initialMfa=false;try{user=await currentUser();if(!user){const client=await authClient();const {data}=await client.auth.getUser();if(data.user){const {data:a}=await client.auth.mfa.getAuthenticatorAssuranceLevel();initialMfa=a?.nextLevel==='aal2'&&a.currentLevel!=='aal2'}}}catch{}if(user)redirect('/dashboard');const params=await searchParams;return <SignIn initialMfa={initialMfa} initialError={googleErrors[params?.google]||''}/>}

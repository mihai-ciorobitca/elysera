import Dashboard from './workspace'
import './workspace.css'
import './white-dashboard.css'
import './partner-program.css'
import {redirect} from 'next/navigation'
import {currentUser,publicProfile} from '@/lib/auth/server'
export const metadata={title:'Partner Dashboard'}
export const dynamic='force-dynamic'
export default async function Page(){let user;try{user=await currentUser()}catch{}if(!user)redirect('/auth/signin');return <Dashboard initialProfile={publicProfile(user)}/>}

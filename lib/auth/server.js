import 'server-only'
import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'
import {prisma} from '@/lib/prisma'
import {authConfig,cookieOptions,storageCookieOptions,eligibleAccount} from './policy.mjs'

export async function authClient(){
 const {url,key}=authConfig();if(!url||!key)throw new Error('AUTH_NOT_CONFIGURED')
 const jar=await cookies()
 return createServerClient(url,key,{cookieOptions:cookieOptions(),cookies:{getAll:()=>jar.getAll(),setAll:items=>{try{for(const item of items)jar.set(item.name,item.value,storageCookieOptions(item.options))}catch{/* Server components use refreshed cookies supplied by proxy. */}}}})
}
export async function principalFor(client){
 const {data,error}=await client.auth.getUser();if(error||!data.user)return null
 const {data:assurance,error:mfaError}=await client.auth.mfa.getAuthenticatorAssuranceLevel()
 if(mfaError||!assurance||(assurance.nextLevel==='aal2'&&assurance.currentLevel!=='aal2'))return null
 const identity=data.user
 const rows=await prisma.$queryRaw`SELECT "id", "email", "firstName", "secondName", "phone", "affiliateCode", "supabaseUserId", "emailVerified", "blocked", "role"::text AS role FROM "User" WHERE "supabaseUserId"=${identity.id}::uuid OR ("supabaseUserId" IS NULL AND lower("email")=${identity.email?.toLowerCase()||''}) LIMIT 2`
 if(rows.length!==1||!eligibleAccount(identity,rows[0]))return null
 return rows[0]
}
export async function currentUser(){const client=await authClient();return principalFor(client)}
export function publicProfile(user){return {id:user.id,name:user.firstName||'',last:user.secondName||'',email:user.email,phone:user.phone||'',affiliateCode:user.affiliateCode||null}}


import {eligibleAdmin} from '@/lib/admin/policy.mjs'
import 'server-only'
import {createServerClient} from '@supabase/ssr'
import {cookies,headers} from 'next/headers'
import {impersonationCookie,impersonatedUser} from './impersonation.mjs'
import {prisma} from '@/lib/prisma'
import {recordFirstLogin} from './login-activity.mjs'
import {authConfig,cookieOptions,storageCookieOptions,eligibleAccount} from './policy.mjs'

export async function authClient(){
 const {url,key}=authConfig();if(!url||!key)throw new Error('AUTH_NOT_CONFIGURED')
 const jar=await cookies()
 return createServerClient(url,key,{cookieOptions:cookieOptions(),cookies:{getAll:()=>jar.getAll(),setAll:items=>{try{for(const item of items)jar.set(item.name,item.value,storageCookieOptions(item.options))}catch{/* Server components use refreshed cookies supplied by proxy. */}}}})
}
async function resolvePrincipal(client,admin=false){
 const {data,error}=await client.auth.getUser();if(error||!data.user)return null
 const {data:assurance,error:mfaError}=await client.auth.mfa.getAuthenticatorAssuranceLevel()
 if(mfaError||!assurance||(assurance.nextLevel==='aal2'&&assurance.currentLevel!=='aal2'))return null
 const identity=data.user
 const rows=await prisma.$queryRaw`SELECT "id", "email", "firstName", "secondName", "phone", "affiliateCode", "supabaseUserId", "emailVerified", "blocked", "role"::text AS role FROM public."User" WHERE "supabaseUserId"=${identity.id}::uuid OR ("supabaseUserId" IS NULL AND lower("email")=${identity.email?.toLowerCase()||''}) LIMIT 2`
 if(rows.length!==1)return null
 const user=rows[0]
 if(admin){const access=await prisma.$queryRaw`SELECT "enabled" FROM public."ElyseraAdminAccess" WHERE "userId"=${user.id}`;if(!eligibleAdmin(identity,user,access[0]?.enabled===true))return null;await recordFirstLogin(prisma,user.id);return {...user,role:'ADMIN'}}
 else if(!eligibleAccount(identity,user))return null
 await recordFirstLogin(prisma,user.id)
 return rows[0]
}
export async function principalFor(client){return resolvePrincipal(client)}
export async function adminPrincipalFor(client){return resolvePrincipal(client,true)}
export async function currentAdmin(){if((await cookies()).get(impersonationCookie))return null;return adminPrincipalFor(await authClient())}
export async function currentUser(){const client=await authClient(),token=(await cookies()).get(impersonationCookie)?.value;if(!token)return principalFor(client);const actor=await adminPrincipalFor(client),user=await impersonatedUser(prisma,actor,token);if(!user)return null;const h=await headers(),method=h.get('x-elysera-method')||'GET',path=h.get('x-elysera-path')||'';if(!['GET','HEAD','OPTIONS'].includes(method))await prisma.$executeRaw`INSERT INTO public."ElyseraImpersonationAction" ("sessionId",method,path) VALUES (${user.impersonationId},${method},${path.slice(0,500)})`;return user}
export function publicProfile(user){return {id:user.id,name:user.firstName||'',last:user.secondName||'',email:user.email,phone:user.phone||'',affiliateCode:user.affiliateCode||null}}

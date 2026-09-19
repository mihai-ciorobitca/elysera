import 'server-only'
import bcrypt from 'bcryptjs'
import {activateRegistration} from './registration-activation'
import {prisma} from '@/lib/prisma'
import {adminClient} from './account-service'

const bcryptHash = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/
const denied = {code:'invalid_credentials',status:400}

// PeptiKing's current password is authoritative for legacy customer accounts.
// Repair only after proving that password; Supabase still issues the session
// and enforces confirmation, bans and MFA in the normal sign-in flow.
export async function prepareLegacyPassword(email,password){
 return prisma.$transaction(async tx=>{
  const users=await tx.$queryRaw`SELECT "id","email","password","supabaseUserId","emailVerified","blocked","role"::text AS role,"emailDeliveryStatus"::text AS "emailDeliveryStatus" FROM public."User" WHERE lower("email")=${email} LIMIT 2 FOR UPDATE`
  if(users.length!==1)return null
  const user=users[0]
  if(['ADMIN','STAFF'].includes(user.role))return null
  if(!bcryptHash.test(user.password||'')){
   if(!user.emailVerified&&user.password?.startsWith('!supabase-only:'))await activateRegistration(email,password,tx)
   return null
  }
  if(user.blocked)return denied
  if(!await bcrypt.compare(password,user.password))return denied
  if(!user.emailVerified&&!await activateRegistration(email,password,tx))return {code:'email_not_confirmed',status:400}
  const identities=await tx.$queryRaw`SELECT id,email,encrypted_password,email_confirmed_at,banned_until FROM auth.users WHERE id=${user.supabaseUserId}::uuid OR lower(email)=${email} LIMIT 2 FOR UPDATE`
  if(identities.length>1)return denied
  let identity=identities[0]
  if(identity){
   if(identity.email?.toLowerCase()!==email||(user.supabaseUserId&&user.supabaseUserId!==identity.id))return denied
   if(identity.banned_until&&new Date(identity.banned_until)>new Date())return denied
   const owners=await tx.$queryRaw`SELECT id FROM public."User" WHERE "supabaseUserId"=${identity.id}::uuid AND id<>${user.id} LIMIT 1`
   if(owners.length)return denied
   if(!identity.email_confirmed_at){
    // Some imported customers were already verified in PeptiKing, but their
    // provider record was not. Repair only after the original password and
    // unique, matching identity have been proved; bans and MFA stay intact.
    if(!user.emailVerified||user.emailDeliveryStatus==='BOUNCED')return {code:'email_not_confirmed',status:400}
    await tx.$executeRaw`UPDATE auth.users SET encrypted_password=${user.password},email_confirmed_at=NOW(),updated_at=NOW() WHERE id=${identity.id}::uuid`
   }else if(identity.encrypted_password!==user.password)await tx.$executeRaw`UPDATE auth.users SET encrypted_password=${user.password},updated_at=NOW() WHERE id=${identity.id}::uuid`
  }else{
   // A dangling explicit link must never be silently replaced.
   if(user.supabaseUserId)return denied
   const {data,error}=await adminClient().auth.admin.createUser({email,password,email_confirm:true})
   if(error)throw Error('LEGACY_IDENTITY_CREATE_FAILED')
   identity=data.user
   if(!identity)throw Error('LEGACY_IDENTITY_CREATE_FAILED')
  }
  if(!user.supabaseUserId)await tx.$executeRaw`UPDATE public."User" SET "supabaseUserId"=${identity.id}::uuid WHERE id=${user.id} AND "supabaseUserId" IS NULL`
  return null
 },{timeout:30000})
}

import {storeDetails} from './details-store'
import 'server-only'
import {cookies} from 'next/headers'
import {randomUUID} from 'node:crypto'
import {prisma} from '@/lib/prisma'
import {referralCookie,referralCode} from './referral-policy.mjs'
export async function insertReferralAccount({id,email,name,last,identityId,verified,details}){
 const code=referralCode((await cookies()).get(referralCookie)?.value)
 return prisma.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(7042601917082026::bigint)`
  let parent=null
  if(code){const rows=await tx.$queryRaw`SELECT "id","level" FROM "User" WHERE "affiliateCode"=${code} AND "blocked"=false AND "emailVerified"=true AND lower("email")<>${email} LIMIT 1`;parent=rows[0];if(!parent)throw Error('REFERRAL_INVALID')}
  const inserted=await tx.$executeRaw`INSERT INTO "User" ("id","email","firstName","secondName","password","supabaseUserId","emailVerified","updatedAt","referredById","level","affiliateCode") VALUES (${id},${email},${name},${last},${'!supabase-only:'+randomUUID()},${identityId}::uuid,${verified},NOW(),${parent?.id||null},${parent?parent.level+1:0},${randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}) ON CONFLICT ("email") DO NOTHING`
  if(inserted&&details)await storeDetails(tx,id,details);return inserted
 })
}

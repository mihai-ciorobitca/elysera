import {insertReferralAccount} from './referral-account'
import 'server-only'
import {randomUUID} from 'node:crypto'
import {prisma} from '@/lib/prisma'
import {googleIdentity} from './google-policy.mjs'
export async function ensureGoogleAccount(identity){if(!googleIdentity(identity))return false;const email=identity.email.toLowerCase();
 const rows=await prisma.$queryRaw`SELECT "id","email","supabaseUserId","blocked","role"::text AS role FROM "User" WHERE "supabaseUserId"=${identity.id}::uuid OR lower("email")=${email} LIMIT 2`;
 if(rows.length){const user=rows[0];return rows.length===1&&!user.blocked&&!['ADMIN','STAFF'].includes(user.role)&&user.email.toLowerCase()===email&&(!user.supabaseUserId||user.supabaseUserId===identity.id)}
 const metadata=identity.user_metadata||{},full=String(metadata.full_name||metadata.name||'').trim().slice(0,160),first=String(metadata.given_name||full.split(' ')[0]||'').slice(0,80),last=String(metadata.family_name||full.split(' ').slice(1).join(' ')||'').slice(0,80);
 await insertReferralAccount({id:randomUUID(),email,name:first,last,identityId:identity.id,verified:true});
 return true
}

import 'server-only'
import {prisma} from '@/lib/prisma'
import {googleIdentity} from './google-policy.mjs'
export async function ensureGoogleAccount(identity){if(!googleIdentity(identity))return false;const email=identity.email.toLowerCase();
 const rows=await prisma.$queryRaw`SELECT "id","email","supabaseUserId","blocked","role"::text AS role FROM "User" WHERE "supabaseUserId"=${identity.id}::uuid OR lower("email")=${email} LIMIT 2`;
 if(rows.length){const user=rows[0];return rows.length===1&&!user.blocked&&!['ADMIN','STAFF'].includes(user.role)&&user.email.toLowerCase()===email&&(!user.supabaseUserId||user.supabaseUserId===identity.id)}
 return 'pending'
}

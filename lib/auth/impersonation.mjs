import {createHash,randomBytes} from 'node:crypto'
export const impersonationCookie='elysera-impersonation'
export const tokenHash=value=>createHash('sha256').update(value).digest('hex')
export const newImpersonationToken=()=>randomBytes(32).toString('hex')
export function eligibleImpersonationTarget(user){return !!user&&!user.adminAccess&&!['ADMIN','STAFF'].includes(user.role)&&((!user.blocked&&user.emailVerified)||user.role==='TEST')}
export async function impersonatedUser(db,actor,token){
 if(!actor||!/^[a-f0-9]{64}$/.test(token||''))return null
 const rows=await db.$queryRaw`SELECT u.id,u.email,u."firstName",u."secondName",u.phone,u."affiliateCode",u."supabaseUserId",u."emailVerified",u.blocked,u.role::text AS role,COALESCE(a.enabled,false) AS "adminAccess",s.id AS "impersonationId" FROM public."ElyseraImpersonationSession" s JOIN public."User" u ON u.id=s."targetId" JOIN public."ElyseraAccountProfile" p ON p."userId"=u.id LEFT JOIN public."ElyseraAdminAccess" a ON a."userId"=u.id WHERE s."tokenHash"=${tokenHash(token)} AND s."actorId"=${actor.id} AND s."endedAt" IS NULL AND s."expiresAt">NOW()`
 const user=rows[0];return eligibleImpersonationTarget(user)?{...user,impersonatedBy:actor.id}:null
}

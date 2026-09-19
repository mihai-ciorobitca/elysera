import 'server-only'
import bcrypt from 'bcryptjs'
import {prisma} from '@/lib/prisma'

// One transaction prevents a successful ELYSERA password change from leaving
// the PeptiKing credential behind (or reviving it on the next legacy login).
export async function setSharedPassword(user,password,db=prisma){
 const hash=await bcrypt.hash(password,12)
 const write=async tx=>{
  const rows=await tx.$queryRaw`SELECT u.id FROM public."User" u JOIN auth.users a ON a.id=u."supabaseUserId" AND lower(a.email)=lower(u.email) WHERE u.id=${user.id} AND u."supabaseUserId"=${user.supabaseUserId}::uuid AND u."emailVerified"=true AND u.blocked=false AND u.role::text NOT IN ('ADMIN','STAFF') AND a.email_confirmed_at IS NOT NULL AND (a.banned_until IS NULL OR a.banned_until<=NOW()) FOR UPDATE OF u,a`
  if(rows.length!==1)throw Error('PASSWORD_ACCOUNT_UNAVAILABLE')
  await tx.$executeRaw`UPDATE public."User" SET password=${hash},"updatedAt"=NOW() WHERE id=${user.id}`
  await tx.$executeRaw`UPDATE auth.users SET encrypted_password=${hash},updated_at=NOW() WHERE id=${user.supabaseUserId}::uuid`
  return true
 }
 return db.$transaction?db.$transaction(write):write(db)
}

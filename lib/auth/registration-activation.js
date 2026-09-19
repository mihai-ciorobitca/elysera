import 'server-only'
import bcrypt from 'bcryptjs'
import {prisma} from '@/lib/prisma'

// Match PeptiKing's immediate signup completion. Existing pending ELYSERA
// accounts require their original password; this is never a password reset.
export async function activateRegistration(email,password,db=prisma){
 const activate=async tx=>{
  const rows=await tx.$queryRaw`SELECT u.id,u.email,u.password,u."supabaseUserId",u."emailVerified",u.blocked,u.role::text AS role,u."emailDeliveryStatus"::text AS "emailDeliveryStatus",a.email AS "authEmail",a.encrypted_password AS "providerPassword",a.banned_until,
   EXISTS(SELECT 1 FROM public."User" other WHERE other."supabaseUserId"=a.id AND other.id<>u.id) AS "conflictingOwner"
   FROM public."User" u JOIN public."ElyseraPartnerProfile" p ON p."userId"=u.id
   JOIN public."ElyseraAccountProfile" profile ON profile."userId"=u.id
   JOIN auth.users a ON a.id=u."supabaseUserId"
   WHERE lower(u.email)=${email} LIMIT 2 FOR UPDATE OF u,a`;
  if(rows.length!==1)return false;
  const user=rows[0];
  if(user.blocked||['ADMIN','STAFF'].includes(user.role)||user.emailDeliveryStatus==='BOUNCED'||user.conflictingOwner||user.authEmail?.toLowerCase()!==email||user.emailVerified)return false;
  if(user.banned_until&&new Date(user.banned_until)>new Date())return false;
  const passwordHash=user.password?.startsWith('!supabase-only:')?user.providerPassword:user.password;
  if(!/^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash||'')||!await bcrypt.compare(password,passwordHash))return false;
  await tx.$executeRaw`UPDATE auth.users SET email_confirmed_at=COALESCE(email_confirmed_at,NOW()),updated_at=NOW() WHERE id=${user.supabaseUserId}::uuid`;
  await tx.$executeRaw`UPDATE public."User" SET "emailVerified"=true,password=${passwordHash},"updatedAt"=NOW() WHERE id=${user.id}`;
  await tx.$executeRaw`DELETE FROM public."EmailVerificationToken" WHERE "userId"=${user.id} AND token LIKE 'elysera:verify:%'`;
  return true;
 };
 return typeof db.$transaction==='function'?db.$transaction(activate,{timeout:30000}):activate(db);
}

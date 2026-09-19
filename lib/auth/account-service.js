import bcrypt from 'bcryptjs'
import {setSharedPassword} from './shared-password'
import {insertReferralAccount} from './referral-account'
import 'server-only'
import {createClient} from '@supabase/supabase-js'
import {randomUUID} from 'node:crypto'
import {prisma} from '@/lib/prisma'
import {authConfig} from './policy.mjs'
import {newToken,tokenDigest} from './account-policy.mjs'
import {sendAccountMail,requireMail,passwordNotice} from './account-mail'
export function adminClient(){const {url}=authConfig();const key=process.env.ELYSERA_SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('AUTH_NOT_CONFIGURED');return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}
export async function findAccount(email){const rows=await prisma.$queryRaw`SELECT "id","email","supabaseUserId","emailVerified","blocked","role"::text AS role FROM public."User" WHERE lower("email")=${email} LIMIT 2`;return rows.length===1?rows[0]:null}
export const allowedAccount=u=>u&&!u.blocked&&!['ADMIN','STAFF'].includes(u.role)
export async function issueToken(user,kind){requireMail();const raw=newToken(),digest=tokenDigest(kind,raw),id=randomUUID(),expires=new Date(Date.now()+30*60000);
 // Keep only ELYSERA tokens in this namespace. Never invalidate another site's reset links.
 if(kind==='verify')await prisma.$executeRaw`INSERT INTO public."EmailVerificationToken" ("id","userId","token","expiresAt","createdAt") VALUES (${id},${user.id},${digest},${expires},NOW())`;
 else await prisma.$executeRaw`INSERT INTO public."PasswordResetToken" ("id","userId","token","expiresAt","createdAt") VALUES (${id},${user.id},${digest},${expires},NOW())`;
 try{await sendAccountMail(user.email,kind,raw)}catch(error){if(kind==='verify')await prisma.$executeRaw`DELETE FROM public."EmailVerificationToken" WHERE "token"=${digest}`;else await prisma.$executeRaw`DELETE FROM public."PasswordResetToken" WHERE "token"=${digest}`;throw error}
}
export async function registerAccount(email,password,name,last,details,referral){requireMail();const existing=await findAccount(email);if(existing){if(allowedAccount(existing)&&!existing.emailVerified)await issueToken(existing,'verify');return}
 const admin=adminClient();const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:false});if(error){if(['email_exists','user_already_exists'].includes(error.code))return;throw Error('REGISTRATION_FAILED')}
 const identity=data.user;if(!identity)throw Error('REGISTRATION_FAILED');const id=randomUUID();
 try{await insertReferralAccount({id,email,name,last,identityId:identity.id,verified:false,details,referral,passwordHash:await bcrypt.hash(password,12)})}
 catch(error){await admin.auth.admin.deleteUser(identity.id);throw error}
 await issueToken({id,email},'verify')
}

async function withAccountToken(kind,raw,apply){
 const digest=tokenDigest(kind,raw)
 return prisma.$transaction(async tx=>{
  const rows=kind==='verify'
   ?await tx.$queryRaw`SELECT u."id",u."email",u."supabaseUserId",u."emailVerified",u."blocked",u."role"::text AS role FROM public."EmailVerificationToken" t JOIN public."User" u ON u.id=t."userId" WHERE t.token=${digest} AND t."expiresAt">NOW() FOR UPDATE OF u,t`
   :await tx.$queryRaw`SELECT u."id",u."email",u."supabaseUserId",u."emailVerified",u."blocked",u."role"::text AS role FROM public."PasswordResetToken" t JOIN public."User" u ON u.id=t."userId" WHERE t.token=${digest} AND t."expiresAt">NOW() FOR UPDATE OF u,t`
  if(rows.length!==1||!allowedAccount(rows[0])||!rows[0].supabaseUserId)return false
  const result=await apply(rows[0],tx)
  if(!result)return false
  if(kind==='verify')await tx.$executeRaw`DELETE FROM public."EmailVerificationToken" WHERE token=${digest}`
  else await tx.$executeRaw`DELETE FROM public."PasswordResetToken" WHERE token=${digest}`
  return result
 },{timeout:30000})
}
export async function verifyEmail(raw){return withAccountToken('verify',raw,async(user,tx)=>{
 const {error}=await adminClient().auth.admin.updateUserById(user.supabaseUserId,{email_confirm:true})
 if(error)throw error
 await tx.$executeRaw`UPDATE public."User" SET "emailVerified"=true,"updatedAt"=NOW() WHERE id=${user.id}`
 return true
})}
export async function resetPassword(raw,password){
 const result=await withAccountToken('reset',raw,async(user,tx)=>{
  if(!user.emailVerified)return false
  await setSharedPassword(user,password,tx)
  return {email:user.email}
 })
 if(!result)return false
 return {ok:true,notificationSent:await passwordNotice(result.email)}
}

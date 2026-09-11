import {insertReferralAccount} from './referral-account'
import 'server-only'
import {createClient} from '@supabase/supabase-js'
import {randomUUID} from 'node:crypto'
import {prisma} from '@/lib/prisma'
import {authConfig} from './policy.mjs'
import {newToken,tokenDigest} from './account-policy.mjs'
import {sendAccountMail,requireMail,passwordNotice} from './account-mail'
export function adminClient(){const {url}=authConfig();const key=process.env.ELYSERA_SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('AUTH_NOT_CONFIGURED');return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}
export async function findAccount(email){const rows=await prisma.$queryRaw`SELECT "id","email","supabaseUserId","emailVerified","blocked","role"::text AS role FROM "User" WHERE lower("email")=${email} LIMIT 2`;return rows.length===1?rows[0]:null}
export const allowedAccount=u=>u&&!u.blocked&&!['ADMIN','STAFF'].includes(u.role)
export async function issueToken(user,kind){requireMail();const raw=newToken(),digest=tokenDigest(kind,raw),id=randomUUID(),expires=new Date(Date.now()+30*60000);
 // Keep only ELYSERA tokens in this namespace. Never invalidate another site's reset links.
 if(kind==='verify')await prisma.$executeRaw`INSERT INTO "EmailVerificationToken" ("id","userId","token","expiresAt","createdAt") VALUES (${id},${user.id},${digest},${expires},NOW())`;
 else await prisma.$executeRaw`INSERT INTO "PasswordResetToken" ("id","userId","token","expiresAt","createdAt") VALUES (${id},${user.id},${digest},${expires},NOW())`;
 try{await sendAccountMail(user.email,kind,raw)}catch(error){if(kind==='verify')await prisma.$executeRaw`DELETE FROM "EmailVerificationToken" WHERE "token"=${digest}`;else await prisma.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "token"=${digest}`;throw error}
}
export async function registerAccount(email,password,name,last,details){requireMail();const existing=await findAccount(email);if(existing){if(allowedAccount(existing)&&!existing.emailVerified)await issueToken(existing,'verify');return}
 const admin=adminClient();const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:false});if(error){if(['email_exists','user_already_exists'].includes(error.code))return;throw Error('REGISTRATION_FAILED')}
 const identity=data.user;if(!identity)throw Error('REGISTRATION_FAILED');const id=randomUUID();
 try{await insertReferralAccount({id,email,name,last,identityId:identity.id,verified:false,details})}
 catch(error){await admin.auth.admin.deleteUser(identity.id);throw error}
 await issueToken({id,email},'verify')
}
export async function consumeToken(kind,raw){const digest=tokenDigest(kind,raw);const rows=kind==='verify'?await prisma.$queryRaw`DELETE FROM "EmailVerificationToken" WHERE "token"=${digest} AND "expiresAt">NOW() RETURNING "userId"`:await prisma.$queryRaw`DELETE FROM "PasswordResetToken" WHERE "token"=${digest} AND "expiresAt">NOW() RETURNING "userId"`;if(rows.length!==1)return null;const users=await prisma.$queryRaw`SELECT "id","email","supabaseUserId","emailVerified","blocked","role"::text AS role FROM "User" WHERE "id"=${rows[0].userId}`;return allowedAccount(users[0])?users[0]:null}
export async function verifyEmail(raw){const user=await consumeToken('verify',raw);if(!user?.supabaseUserId)return false;const {error}=await adminClient().auth.admin.updateUserById(user.supabaseUserId,{email_confirm:true});if(error)throw error;await prisma.$executeRaw`UPDATE "User" SET "emailVerified"=true,"updatedAt"=NOW() WHERE "id"=${user.id}`;return true}
export async function resetPassword(raw,password){const user=await consumeToken('reset',raw);if(!user?.supabaseUserId||!user.emailVerified)return false;const {error}=await adminClient().auth.admin.updateUserById(user.supabaseUserId,{password});if(error)throw error;return {ok:true,notificationSent:await passwordNotice(user.email)}}

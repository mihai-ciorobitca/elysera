import 'server-only'
import {createHmac} from 'node:crypto'
import {prisma} from '@/lib/prisma'
export async function loginRateLimit(request,email='',action='signin'){
 const secret=process.env.ELYSERA_RATE_LIMIT_SECRET;if(!secret)throw new Error('RATE_LIMIT_NOT_CONFIGURED')
 // Only the hosting provider's trusted forwarded address is used in production.
 const ip=process.env.VERCEL?(request.headers.get('x-vercel-forwarded-for')||'unknown').split(',')[0].trim():'local'
 for(const [kind,value,max]of [['ip',ip,40],['email',email.toLowerCase(),10]]){
  const key=createHmac('sha256',secret).update(`elysera:${action}:${kind}:${value}`).digest('hex')
  const rows=await prisma.$queryRaw`INSERT INTO "AiRateLimitBucket" ("key","count","resetAt","createdAt","updatedAt") VALUES (${key},1,NOW()+INTERVAL '15 minutes',NOW(),NOW()) ON CONFLICT ("key") DO UPDATE SET "count"=CASE WHEN "AiRateLimitBucket"."resetAt"<=NOW() THEN 1 ELSE "AiRateLimitBucket"."count"+1 END,"resetAt"=CASE WHEN "AiRateLimitBucket"."resetAt"<=NOW() THEN NOW()+INTERVAL '15 minutes' ELSE "AiRateLimitBucket"."resetAt" END,"updatedAt"=NOW() RETURNING "count"`
  if(rows[0].count>max)return false
 }
 return true
}

import {NextResponse} from 'next/server'
import {currentUser} from '@/lib/auth/server'
import {prisma} from '@/lib/prisma'
import {Prisma} from '@prisma/client'
import {canViewFullNetwork} from '@/lib/auth/network-access.mjs'
import {OWN_IDS,PAID} from '@/lib/admin/reports-model.mjs'
const reply=(data,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){try{const user=await currentUser();if(!user)return reply({error:'Bitte anmelden.'},401)
 if(canViewFullNetwork(user)){
 const partners=await prisma.$queryRaw`WITH RECURSIVE network AS (
 SELECT u."id",r."parentUserId" AS "parentId",u."firstName",LEFT(u."secondName",1) AS "secondName",r."createdAt",1 AS depth,ARRAY[${user.id},u."id"]::text[] AS path
 FROM public."ElyseraPartnerProfile" r JOIN public."User" u ON u."id"=r."userId" WHERE r."parentUserId"=${user.id} AND u."id"<>${user.id}
 UNION ALL
 SELECT u."id",r."parentUserId",u."firstName",LEFT(u."secondName",1),r."createdAt",n.depth+1,n.path||u."id"
 FROM public."ElyseraPartnerProfile" r JOIN public."User" u ON u."id"=r."userId" JOIN network n ON r."parentUserId"=n."id" WHERE NOT(u."id"=ANY(n.path))
 ) SELECT "id","parentId","firstName","secondName","createdAt",depth FROM network ORDER BY depth,"createdAt","id"`
 const revenue=await prisma.$queryRaw`SELECT COALESCE(SUM(o."total"),0) AS total FROM public."Order" o WHERE o.status::text IN (${Prisma.join(PAID)}) AND EXISTS (SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o.id AND i."productId" IN (${Prisma.join(OWN_IDS)})) AND NOT EXISTS (SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o.id AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(OWN_IDS)})))`
 return reply({rootId:user.id,partners,total:partners.length,truncated:false,totalRevenue:Number(revenue[0]?.total||0)})
 }
 const rows=await prisma.$queryRaw`
 SELECT u."id",r."parentUserId" AS "parentId",u."firstName",LEFT(u."secondName",1) AS "secondName",r."createdAt",1 AS depth,COUNT(*) OVER() AS total
 FROM public."ElyseraPartnerProfile" r JOIN public."User" u ON u."id"=r."userId" WHERE r."parentUserId"=${user.id} AND u."id"<>${user.id}
 ORDER BY r."createdAt",u."id"`
 const total=Number(rows[0]?.total||0);return reply({rootId:user.id,partners:rows.map(({total,...p})=>p),total,truncated:false})
 }catch{return reply({error:'Dein Partnernetzwerk konnte gerade nicht geladen werden.'},503)}}

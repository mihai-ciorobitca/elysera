import {NextResponse} from 'next/server'
import {currentUser} from '@/lib/auth/server'
import {prisma} from '@/lib/prisma'
const reply=(data,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){try{const user=await currentUser();if(!user)return reply({error:'Bitte anmelden.'},401)
 const rows=await prisma.$queryRaw`WITH RECURSIVE network AS (
 SELECT u."id",r."parentUserId" AS "parentId",u."firstName",u."secondName",r."createdAt",1 AS depth,ARRAY[${user.id},u."id"]::text[] AS path
 FROM public."ElyseraPartnerProfile" r JOIN public."User" u ON u."id"=r."userId" WHERE r."parentUserId"=${user.id} AND u."id"<>${user.id}
 UNION ALL
 SELECT u."id",r."parentUserId",u."firstName",u."secondName",r."createdAt",n.depth+1,n.path||u."id"
 FROM public."ElyseraPartnerProfile" r JOIN public."User" u ON u."id"=r."userId" JOIN network n ON r."parentUserId"=n."id" WHERE NOT(u."id"=ANY(n.path))
 ) SELECT "id","parentId","firstName",LEFT("secondName",1) AS "secondName","createdAt",depth,COUNT(*) OVER() AS total FROM network ORDER BY depth,"createdAt","id"`
 const total=Number(rows[0]?.total||0);return reply({rootId:user.id,partners:rows.map(({total,...p})=>p),total,truncated:false})
 }catch{return reply({error:'Dein Partnernetzwerk konnte gerade nicht geladen werden.'},503)}}

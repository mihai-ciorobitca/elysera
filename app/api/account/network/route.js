import {NextResponse} from 'next/server'
import {currentUser} from '@/lib/auth/server'
import {prisma} from '@/lib/prisma'
const reply=(data,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){try{const user=await currentUser();if(!user)return reply({error:'Bitte anmelden.'},401)
 const rows=await prisma.$queryRaw`WITH RECURSIVE network AS (
 SELECT u."id",u."referredById" AS "parentId",u."firstName",u."secondName",u."createdAt",1 AS depth,ARRAY[${user.id},u."id"]::text[] AS path
 FROM "User" u WHERE u."referredById"=${user.id} AND u."id"<>${user.id}
 UNION ALL
 SELECT u."id",u."referredById",u."firstName",u."secondName",u."createdAt",n.depth+1,n.path||u."id"
 FROM "User" u JOIN network n ON u."referredById"=n."id" WHERE n.depth<100 AND NOT(u."id"=ANY(n.path))
 ) SELECT "id","parentId","firstName",LEFT("secondName",1) AS "secondName","createdAt",depth,COUNT(*) OVER() AS total FROM network ORDER BY depth,"createdAt","id" LIMIT 5000`
 const total=Number(rows[0]?.total||0);return reply({rootId:user.id,partners:rows.map(({total,...p})=>p),total,truncated:total>rows.length,maxDepth:100})
 }catch{return reply({error:'Dein Partnernetzwerk konnte gerade nicht geladen werden.'},503)}}

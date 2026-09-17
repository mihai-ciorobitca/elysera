import {Prisma} from '@prisma/client'
import {OWN_IDS,PAID} from './admin/reports-model.mjs'

export async function networkSummary(db,userId){
 const [row]=await db.$queryRaw`WITH RECURSIVE team AS (
 SELECT p."userId" AS id,ARRAY[${userId},p."userId"]::text[] AS path FROM public."ElyseraPartnerProfile" p WHERE p."parentUserId"=${userId} AND p."userId"<>${userId}
 UNION ALL
 SELECT p."userId",t.path||p."userId" FROM team t JOIN public."ElyseraPartnerProfile" p ON p."parentUserId"=t.id WHERE NOT(p."userId"=ANY(t.path))
 ) SELECT
 (SELECT COALESCE(SUM(o.total::numeric),0) FROM public."Order" o WHERE o."userId" IN (SELECT id FROM team) AND o.status::text IN (${Prisma.join(PAID)}) AND EXISTS (SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o.id AND i."productId" IN (${Prisma.join(OWN_IDS)})) AND NOT EXISTS (SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o.id AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(OWN_IDS)})))) AS "teamRevenue"`
 return {teamRevenue:Number(row?.teamRevenue||0)}
}

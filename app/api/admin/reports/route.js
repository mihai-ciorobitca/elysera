import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {rangeDates,reportSnapshot,OWN_IDS,validateCosts} from '@/lib/admin/reports-model.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){try{
 if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 let range;try{range=rangeDates(new URL(request.url).searchParams)}catch{return reply({error:'Bitte einen gültigen Zeitraum wählen.'},400)}
 const ids=OWN_IDS
 const rows=await prisma.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total",(SELECT jsonb_agg(jsonb_build_object('productId',i."productId",'quantity',i."quantity",'price',i."price",'name',p."name")) FROM public."OrderItem" i LEFT JOIN public."Products" p ON p."id"=i."productId" WHERE i."orderId"=o."id") AS items FROM public."Order" o WHERE o."createdAt">=${range.start} AND o."createdAt"<${range.end} AND EXISTS (SELECT 1 FROM public."OrderItem" own WHERE own."orderId"=o."id" AND own."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS (SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o."id" AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(ids)}))) ORDER BY o."createdAt" DESC LIMIT 10001`
 if(rows.length>10000)return reply({error:'Mehr als 10.000 Bestellungen. Bitte Zeitraum verkürzen.'},422)
 const configs=await prisma.$queryRaw`SELECT "costs","version","updatedAt" FROM public."ElyseraFinanceConfig" WHERE "id"='current'`
 const config=configs[0]||{costs:Object.fromEntries(ids.map(id=>[id,null])),version:0,updatedAt:null}
 validateCosts({costs:config.costs,expectedVersion:config.version})
 return reply(reportSnapshot(rows,config,range))
 }catch{return reply({error:'Berichte nicht verfügbar. Verbindung und Finanzmigration prüfen.'},503)}}

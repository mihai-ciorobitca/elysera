import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){
 try{
  if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const ids=ELYSERA_PRODUCTS.map(p=>p.id)
  const rows=await prisma.$queryRaw`SELECT o."id",o."userId",o."paidAt",o."createdAt",o."status"::text AS status,o."total",to_jsonb(o)->'coupon-eur' AS discount,to_jsonb(o)->'outstandingEur' AS outstanding,to_jsonb(o)->'packageTrackingEur' AS "trackingFee",COALESCE(ops."trackingNumber",to_jsonb(o)->>'trackingNumber') AS "trackingNumber",COALESCE(ops."trackingCarrier",to_jsonb(o)->>'trackingCarrier') AS "trackingCarrier",to_jsonb(o)->'shippingName' AS "shippingName",to_jsonb(o)->'shippingAddress1' AS "shippingAddress1",to_jsonb(o)->'shippingAddress2' AS "shippingAddress2",to_jsonb(o)->'shippingCity' AS "shippingCity",to_jsonb(o)->'shippingPostalCode' AS "shippingPostalCode",to_jsonb(o)->'shippingCountry' AS "shippingCountry",u."firstName",u."secondName",u."email",json_agg(json_build_object('name',p."name",'productId',i."productId",'quantity',i."quantity",'price',i."price")) AS items FROM public."Order" o LEFT JOIN public."ElyseraOrderOperations" ops ON ops."orderId"=o."id" JOIN public."User" u ON u."id"=o."userId" JOIN public."OrderItem" i ON i."orderId"=o."id" JOIN public."Products" p ON p."id"=i."productId" WHERE EXISTS(SELECT 1 FROM public."OrderItem" own WHERE own."orderId"=o."id" AND own."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS(SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o."id" AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(ids)}))) GROUP BY o."id",u."id",ops."orderId" ORDER BY o."createdAt" DESC,o."id" LIMIT 501`
  return reply({orders:rows.slice(0,500),limited:rows.length>500,limit:500})
 }catch{return reply({error:'Bestellungen konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}

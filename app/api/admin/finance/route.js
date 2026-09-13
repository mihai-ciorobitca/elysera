import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {periodStart,summarize} from './model.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){
 try{
  if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const period=new URL(request.url).searchParams.get('period')||'30'
  let start;try{start=periodStart(period)}catch{return reply({error:'Ungültiger Zeitraum.'},400)}
  const end=new Date(),ids=ELYSERA_PRODUCTS.map(p=>p.id)
  if(!ids.length)return reply({error:'ELYSERA-Sortiment nicht verfügbar.'},503)
  const rows=await prisma.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total" FROM public."Order" o WHERE o."createdAt">=${start} AND o."createdAt"<=${end} AND EXISTS (SELECT 1 FROM public."OrderItem" own WHERE own."orderId"=o."id" AND own."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS (SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o."id" AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(ids)}))) ORDER BY o."createdAt" DESC LIMIT 10001`
  if(rows.length>10000)return reply({error:'Mehr als 10.000 Bestellungen: Bitte einen kürzeren Zeitraum wählen.'},422)
  const orders=rows.map(r=>({...r,total:Number(r.total)}))
  return reply({orders,summary:summarize(orders),period,start:start.toISOString(),end:end.toISOString(),source:'database'})
 }catch{return reply({error:'Finanzdaten konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}

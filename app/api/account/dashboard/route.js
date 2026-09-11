import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentUser} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
export const dynamic='force-dynamic'
export async function GET(){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({error:'Bitte anmelden.'},{status:401})
  const ids=ELYSERA_PRODUCTS.map(p=>p.id)
  // Exclude mixed-brand orders altogether: no other catalog, balances or metadata is exposed.
  const orders=await prisma.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total",o."coupon-eur" AS discount, json_agg(json_build_object('productId',i."productId",'quantity',i."quantity",'price',i."price")) AS items FROM "Order" o JOIN "OrderItem" i ON i."orderId"=o."id" WHERE o."userId"=${user.id} AND i."productId" IN (${Prisma.join(ids)}) AND NOT EXISTS (SELECT 1 FROM "OrderItem" other WHERE other."orderId"=o."id" AND other."productId" NOT IN (${Prisma.join(ids)})) GROUP BY o."id" ORDER BY o."createdAt" DESC LIMIT 200`
  const commissions=await prisma.$queryRaw`SELECT c."id",c."orderId",c."amount",c."status"::text AS status,c."createdAt",c."holdUntil" FROM "Commission" c WHERE c."userId"=${user.id} AND c."orderId" IS NOT NULL AND EXISTS (SELECT 1 FROM "OrderItem" i WHERE i."orderId"=c."orderId" AND i."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS (SELECT 1 FROM "OrderItem" other WHERE other."orderId"=c."orderId" AND other."productId" NOT IN (${Prisma.join(ids)})) ORDER BY c."createdAt" DESC LIMIT 200`
  return NextResponse.json({orders,commissions,limit:200},{headers:{'Cache-Control':'private, no-store'}})
 }catch{return NextResponse.json({error:'Deine Daten konnten gerade nicht geladen werden.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}

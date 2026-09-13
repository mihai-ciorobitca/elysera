import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {partnerGraph} from '@/lib/admin/partners-policy.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){
 try{
  if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const id=new URL(request.url).searchParams.get('id');if(id!==null&&(!id||id.length>100))return reply({error:'Ungültige Profilnummer.'},400)
  const ids=ELYSERA_PRODUCTS.map(p=>p.id);if(!ids.length)return reply({error:'ELYSERA-Sortiment nicht verfügbar.'},503)
  const result=await prisma.$transaction(async tx=>{
   const accounts=await tx.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email",p."updatedAt" FROM public."ElyseraAccountProfile" p JOIN public."User" u ON u."id"=p."userId" ORDER BY p."updatedAt" DESC,u."id" LIMIT 5001`;
   if(accounts.length>5000)return {error:'Mehr als 5.000 Profile: Das Netzwerk benötigt eine erweiterte Seiteneinteilung.',status:422};
   if(id&&!accounts.some(a=>a.id===id))return {error:'ELYSERA-Profil nicht gefunden.',status:404};
   const table=await tx.$queryRaw`SELECT to_regclass('public."ElyseraPartnerProfile"') IS NOT NULL AS ready`;
   const relationships=table[0]?.ready?await tx.$queryRaw`SELECT r."userId",r."parentUserId",r."status" FROM public."ElyseraPartnerProfile" r JOIN public."ElyseraAccountProfile" a ON a."userId"=r."userId" WHERE r."parentUserId" IS NULL OR EXISTS(SELECT 1 FROM public."ElyseraAccountProfile" p WHERE p."userId"=r."parentUserId")`:[];
   const partners=partnerGraph(accounts,relationships);
   if(!id)return {partners,relationshipsReady:Boolean(table[0]?.ready),source:'database'};
   const orders=await tx.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total",(SELECT json_agg(json_build_object('name',p."name",'quantity',i."quantity")) FROM public."OrderItem" i JOIN public."Products" p ON p."id"=i."productId" WHERE i."orderId"=o."id") AS items FROM public."Order" o WHERE o."userId"=${id} AND EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND i."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND (i."productId" IS NULL OR i."productId" NOT IN (${Prisma.join(ids)}))) ORDER BY o."createdAt" DESC,o."id" LIMIT 101`;
   const commissions=await tx.$queryRaw`SELECT c."id",c."createdAt",c."level",c."amount",c."status"::text AS status,c."convertedToCredits",o."id" AS "orderId",o."total" AS "orderTotal",o."status"::text AS "orderStatus",u."firstName",u."secondName",(SELECT json_agg(json_build_object('name',p."name",'quantity',i."quantity")) FROM public."OrderItem" i JOIN public."Products" p ON p."id"=i."productId" WHERE i."orderId"=o."id") AS items FROM public."Commission" c JOIN public."Order" o ON o."id"=c."orderId" JOIN public."ElyseraAccountProfile" buyer ON buyer."userId"=o."userId" JOIN public."User" u ON u."id"=buyer."userId" WHERE c."userId"=${id} AND EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND i."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND (i."productId" IS NULL OR i."productId" NOT IN (${Prisma.join(ids)}))) ORDER BY c."createdAt" DESC,c."id" LIMIT 101`;
   return {partner:partners.find(p=>p.id===id),orders:orders.slice(0,100),commissions:commissions.slice(0,100),ordersLimited:orders.length>100,commissionsLimited:commissions.length>100,source:'database'}
  },{timeout:30000,maxWait:10000,isolationLevel:'RepeatableRead'});
  if(result.error)return reply({error:result.error},result.status);return reply(result)
 }catch{return reply({error:'Partnerdaten konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}

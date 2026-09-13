import {orderStates} from '@/lib/admin/policy.mjs'
import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request,{params}){
 try{
  if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const {section}=await params,ids=ELYSERA_PRODUCTS.map(p=>p.id)
  if(section==='products'){
   const rows=await prisma.product.findMany({where:{id:{in:ids}},orderBy:{name:'asc'}})
   return reply({rows:rows.map(r=>[r.name,'',String(r.price)+' €',String(r.stock),r.active?'Aktiv':'Inaktiv']),source:'database',editable:false})
  }
  if(section==='users'){
   const rows=await prisma.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email",u."role"::text AS role,u."blocked" FROM public."User" u JOIN public."ElyseraAccountProfile" p ON p."userId"=u."id" ORDER BY u."id" LIMIT 500`
   return reply({rows:rows.map(r=>[[r.firstName,r.secondName].filter(Boolean).join(' '),r.email,r.role,'',r.blocked?'Gesperrt':'Aktiv']),source:'database',editable:false,limit:500})
  }
  if(section==='orders'){
   const rows=await prisma.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total",u."firstName",u."secondName",json_agg(json_build_object('name',p."name",'quantity',i."quantity")) AS items FROM public."Order" o JOIN public."User" u ON u."id"=o."userId" JOIN public."OrderItem" i ON i."orderId"=o."id" JOIN public."Products" p ON p."id"=i."productId" WHERE EXISTS (SELECT 1 FROM public."OrderItem" own WHERE own."orderId"=o."id" AND own."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS (SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o."id" AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(ids)}))) GROUP BY o."id",u."firstName",u."secondName" ORDER BY o."createdAt" DESC LIMIT 500`
   return reply({rows:rows.map(r=>[r.id,[r.firstName,r.secondName].filter(Boolean).join(' '),r.items.map(i=>i.quantity+' × '+i.name).join(', '),String(r.items.reduce((sum,i)=>sum+i.quantity,0)),String(r.total)+' €',...orderStates(r.status),r.createdAt]),source:'database',editable:false,limit:500})
  }
  return reply({error:'Diese Funktion wird noch aus PeptiKing übernommen. Es werden keine Beispieldaten als Live-Daten angezeigt.',code:'NOT_PORTED'},501)
 }catch{return reply({error:'Die ELYSERA-Daten konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}

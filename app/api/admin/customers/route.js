import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {validateContact} from './policy.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){
 try{
  if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const id=new URL(request.url).searchParams.get('id')
  if(id!==null&&(!id||id.length>100))return reply({error:'Ungültige Kundennummer.'},400)
  if(id){
   const rows=await prisma.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email",jsonb_build_object('street',p."details"->>'street','houseNumber',p."details"->>'houseNumber','postalCode',p."details"->>'postalCode','city',p."details"->>'city','country',p."details"->>'country','phone',p."details"->>'phone') AS details,p."updatedAt" FROM public."User" u JOIN public."ElyseraAccountProfile" p ON p."userId"=u."id" WHERE u."id"=${id}`
   if(!rows.length)return reply({error:'ELYSERA-Kundenprofil nicht gefunden.'},404)
   const ids=ELYSERA_PRODUCTS.map(p=>p.id)
   const orders=await prisma.$queryRaw`SELECT o."id",o."createdAt",o."status"::text AS status,o."total",json_agg(json_build_object('name',p."name",'quantity',i."quantity")) AS items FROM public."Order" o JOIN public."OrderItem" i ON i."orderId"=o."id" JOIN public."Products" p ON p."id"=i."productId" WHERE o."userId"=${id} AND EXISTS(SELECT 1 FROM public."OrderItem" own WHERE own."orderId"=o."id" AND own."productId" IN (${Prisma.join(ids)})) AND NOT EXISTS(SELECT 1 FROM public."OrderItem" other WHERE other."orderId"=o."id" AND (other."productId" IS NULL OR other."productId" NOT IN (${Prisma.join(ids)}))) GROUP BY o."id" ORDER BY o."createdAt" DESC LIMIT 101`
   return reply({customer:rows[0],orders:orders.slice(0,100),limited:orders.length>100})
  }
  const customers=await prisma.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email",jsonb_build_object('street',p."details"->>'street','houseNumber',p."details"->>'houseNumber','postalCode',p."details"->>'postalCode','city',p."details"->>'city','country',p."details"->>'country','phone',p."details"->>'phone') AS details,p."updatedAt" FROM public."User" u JOIN public."ElyseraAccountProfile" p ON p."userId"=u."id" ORDER BY p."updatedAt" DESC,u."id"`
  return reply({customers,limited:false})
 }catch{return reply({error:'Kunden konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}
export async function PATCH(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403)
 try{
  const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const text=await request.text();if(text.length>4096)return reply({error:'Ungültige Eingabe.'},400)
  let body;try{body=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!=='contact,id,updatedAt')return reply({error:'Ungültige Eingabe.'},400)
  const contact=validateContact(body?.contact)
  if(!contact||typeof body?.id!=='string'||!body.id||body.id.length>100||typeof body.updatedAt!=='string'||!Number.isFinite(Date.parse(body.updatedAt)))return reply({error:'Bitte Adresse und Telefonnummer prüfen.'},400)
  const profile=await prisma.$transaction(async tx=>{
   const rows=await tx.$queryRaw`SELECT "details","updatedAt" FROM public."ElyseraAccountProfile" WHERE "userId"=${body.id} FOR UPDATE`
   if(!rows.length||new Date(rows[0].updatedAt).toISOString()!==new Date(body.updatedAt).toISOString())throw Error('PROFILE_CHANGED')
   const before=Object.fromEntries(Object.keys(contact).map(k=>[k,rows[0].details?.[k]??'']))
   const changed=await tx.$queryRaw`UPDATE public."ElyseraAccountProfile" SET "details"=COALESCE("details",'{}'::jsonb)||${JSON.stringify(contact)}::jsonb,"updatedAt"=NOW() WHERE "userId"=${body.id} RETURNING "details","updatedAt"`
   const after=Object.fromEntries(Object.keys(contact).map(k=>[k,changed[0].details?.[k]??'']))
   await tx.$executeRaw`INSERT INTO public."ElyseraCustomerAudit" ("actorId","customerId","before","after") VALUES (${String(admin.id)},${body.id},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb)`
   return {details:after,updatedAt:changed[0].updatedAt}
  },{timeout:30000,maxWait:10000})
  return reply({profile})
 }catch(error){if(error?.message==='PROFILE_CHANGED')return reply({error:'Das Profil wurde geändert oder ist nicht verfügbar. Bitte schließen und neu öffnen.'},409);return reply({error:'Kontaktangaben konnten nicht gespeichert werden. Es wurde keine Änderung bestätigt.'},503)}
}

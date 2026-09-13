import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {validateCoupon} from './policy.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const unpack=r=>({...r.data,id:r.id,version:r.version,createdAt:r.createdAt,updatedAt:r.updatedAt})
export async function GET(request){try{
 if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const recipientId=new URL(request.url).searchParams.get('recipientId')
 if(recipientId!==null){if(!recipientId||recipientId.length>100)return reply({error:'Ungültiger Empfänger.'},400);const recipients=await prisma.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email" FROM public."ElyseraAccountProfile" p JOIN public."User" u ON u."id"=p."userId" WHERE p."userId"=${recipientId}`;return reply({recipient:recipients[0]||null})}
 const id=new URL(request.url).searchParams.get('id')
 if(id!==null&&(!id||id.length>100))return reply({error:'Ungültige Gutscheinnummer.'},400)
 if(id){const rows=await prisma.$queryRaw`SELECT * FROM public."ElyseraCoupon" WHERE "id"=${id}`;if(!rows.length)return reply({error:'Gutschein nicht gefunden.'},404);const history=await prisma.$queryRaw`SELECT "id","actorId","before","after","createdAt" FROM public."ElyseraCouponAudit" WHERE "couponId"=${id} ORDER BY "createdAt" DESC LIMIT 100`;return reply({coupon:unpack(rows[0]),history})}
 const rows=await prisma.$queryRaw`SELECT * FROM public."ElyseraCoupon" ORDER BY "updatedAt" DESC,"id" LIMIT 1001`
 return reply({coupons:rows.slice(0,1000).map(unpack),limited:rows.length>1000})
 }catch{return reply({error:'Gutscheine konnten nicht geladen werden. Bitte erneut versuchen.'},503)}}
async function write(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403)
 try{const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const text=await request.text();if(text.length>8192)throw Error('INVALID');let b;try{b=JSON.parse(text)}catch{throw Error('INVALID')}
 if(!b||Object.keys(b).sort().join(',')!=='coupon,expectedVersion,id,idempotencyKey'||typeof b.idempotencyKey!=='string'||! /^[0-9a-f-]{36}$/i.test(b.idempotencyKey))throw Error('INVALID')
 if(request.method==='POST'?(b.id!==null||b.expectedVersion!==null):(typeof b.id!=='string'||!b.id||b.id.length>100||!Number.isInteger(b.expectedVersion)||b.expectedVersion<1))throw Error('INVALID')
 const data=validateCoupon(b.coupon),payload=JSON.stringify({...b,coupon:data}),actor=String(admin.id)
 const result=await prisma.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${b.idempotencyKey}))`
 const prior=await tx.$queryRaw`SELECT "actorId","request","after" FROM public."ElyseraCouponAudit" WHERE "idempotencyKey"=${b.idempotencyKey}`
 if(prior.length){if(prior[0].actorId!==actor)throw Error('CONFLICT');const equal=await tx.$queryRaw`SELECT ${JSON.stringify(prior[0].request)}::jsonb = ${payload}::jsonb AS equal`;if(!equal[0]?.equal)throw Error('CONFLICT');return {coupon:prior[0].after,replayed:true}}
 if(data.assignedUserId){const recipient=await tx.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${data.assignedUserId} FOR KEY SHARE`;if(!recipient.length)throw Error('RECIPIENT')}
 let before=null,rows
 if(b.id){const existing=await tx.$queryRaw`SELECT * FROM public."ElyseraCoupon" WHERE "id"=${b.id} FOR UPDATE`;if(!existing.length||existing[0].version!==b.expectedVersion)throw Error('STALE_VERSION');before=unpack(existing[0]);rows=await tx.$queryRaw`UPDATE public."ElyseraCoupon" SET "code"=${data.code},"data"=${JSON.stringify(data)}::jsonb,"assignedUserId"=${data.assignedUserId},"version"="version"+1,"updatedAt"=now() WHERE "id"=${b.id} RETURNING *`}
 else rows=await tx.$queryRaw`INSERT INTO public."ElyseraCoupon"("code","data","assignedUserId") VALUES (${data.code},${JSON.stringify(data)}::jsonb,${data.assignedUserId}) RETURNING *`
 const after=unpack(rows[0]);await tx.$executeRaw`INSERT INTO public."ElyseraCouponAudit"("couponId","actorId","idempotencyKey","request","before","after") VALUES (${after.id},${actor},${b.idempotencyKey},${payload}::jsonb,${before?JSON.stringify(before):null}::jsonb,${JSON.stringify(after)}::jsonb)`
 return {coupon:after}
 },{timeout:30000,maxWait:10000});return reply(result)
 }catch(e){if(e.message==='INVALID')return reply({code:'INVALID',error:'Bitte Gutscheinwerte und Zeitraum prüfen.'},400);if(e.message==='RECIPIENT')return reply({code:'RECIPIENT',error:'Empfänger benötigt ein ELYSERA-Kundenprofil.'},400);if(e.message==='STALE_VERSION')return reply({code:'STALE_VERSION',error:'Gutschein wurde geändert. Aktuellen Stand neu laden.'},409);if(e.message==='CONFLICT')return reply({code:'REQUEST_CONFLICT',error:'Die gespeicherte Anfrage stimmt nicht überein. Anfrage bleibt zur Klärung erhalten.'},409);if(e.code==='P2002'||e.meta?.code==='23505')return reply({code:'DUPLICATE_CODE',error:'Dieser Gutscheincode ist bereits vergeben.'},409);return reply({error:'Speichern nicht bestätigt. Dieselbe Anfrage kann sicher erneut versucht werden.'},503)}
}
export const POST=write
export const PATCH=write

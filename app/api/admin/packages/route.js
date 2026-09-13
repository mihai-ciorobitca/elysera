import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {validatePackage,pricing,productIds} from './policy.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const unpack=r=>({...r.data,id:r.id,version:r.version,createdAt:r.createdAt,updatedAt:r.updatedAt})
export async function GET(request){try{
 if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const products=await prisma.$queryRaw`SELECT "id","name","price","stock","active" FROM public."Products" WHERE "id" IN (${productIds[0]},${productIds[1]},${productIds[2]})`
 const id=new URL(request.url).searchParams.get('id')
 if(id!==null&&(!id||id.length>100))return reply({error:'Ungültige Setnummer.'},400)
 if(id){const rows=await prisma.$queryRaw`SELECT * FROM public."ElyseraPackage" WHERE "id"=${id}`;if(!rows.length)return reply({error:'Set nicht gefunden.'},404);const history=await prisma.$queryRaw`SELECT "id","actorId","before","after","createdAt" FROM public."ElyseraPackageAudit" WHERE "packageId"=${id} ORDER BY "createdAt" DESC LIMIT 100`;return reply({package:unpack(rows[0]),history,products})}
 const rows=await prisma.$queryRaw`SELECT * FROM public."ElyseraPackage" ORDER BY "updatedAt" DESC,"id" LIMIT 1001`
 return reply({packages:rows.slice(0,1000).map(r=>({...unpack(r),pricing:pricing(r.data.items,products)})),products,limited:rows.length>1000})
 }catch{return reply({error:'Sets konnten nicht geladen werden. Bitte erneut versuchen.'},503)}}
async function write(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403)
 try{const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const text=await request.text();if(text.length>24000)throw Error('INVALID');let b;try{b=JSON.parse(text)}catch{throw Error('INVALID')}
 if(!b||Object.keys(b).sort().join(',')!=='expectedVersion,id,idempotencyKey,package'||typeof b.idempotencyKey!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.idempotencyKey))throw Error('INVALID')
 if(request.method==='POST'?(b.id!==null||b.expectedVersion!==null):(typeof b.id!=='string'||!b.id||b.id.length>100||!Number.isInteger(b.expectedVersion)||b.expectedVersion<1))throw Error('INVALID')
 const data=validatePackage(b.package),payload=JSON.stringify({...b,package:data}),actor=String(admin.id)
 const result=await prisma.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${b.idempotencyKey}))`
 const prior=await tx.$queryRaw`SELECT "actorId","request","after" FROM public."ElyseraPackageAudit" WHERE "idempotencyKey"=${b.idempotencyKey}`
 if(prior.length){if(prior[0].actorId!==actor)throw Error('CONFLICT');const equal=await tx.$queryRaw`SELECT ${JSON.stringify(prior[0].request)}::jsonb = ${payload}::jsonb AS equal`;if(!equal[0]?.equal)throw Error('CONFLICT');return {package:prior[0].after,replayed:true}}
 const catalog=await tx.$queryRaw`SELECT "id" FROM public."Products" WHERE "id" IN (${productIds[0]},${productIds[1]},${productIds[2]}) FOR KEY SHARE`
 if(data.items.some(i=>!catalog.some(p=>p.id===i.productId)))throw Error('INVALID')
 let before=null,rows
 if(b.id){const existing=await tx.$queryRaw`SELECT * FROM public."ElyseraPackage" WHERE "id"=${b.id} FOR UPDATE`;if(!existing.length||existing[0].version!==b.expectedVersion)throw Error('STALE_VERSION');before=unpack(existing[0]);rows=await tx.$queryRaw`UPDATE public."ElyseraPackage" SET "slug"=${data.slug},"data"=${JSON.stringify(data)}::jsonb,"version"="version"+1,"updatedAt"=now() WHERE "id"=${b.id} RETURNING *`}
 else rows=await tx.$queryRaw`INSERT INTO public."ElyseraPackage"("slug","data") VALUES (${data.slug},${JSON.stringify(data)}::jsonb) RETURNING *`
 const persisted=await tx.$queryRaw`SELECT * FROM public."ElyseraPackage" WHERE "id"=${rows[0].id}`;if(!persisted[0])throw Error("READBACK");const after=unpack(persisted[0]);await tx.$executeRaw`INSERT INTO public."ElyseraPackageAudit"("packageId","actorId","idempotencyKey","request","before","after") VALUES (${after.id},${actor},${b.idempotencyKey},${payload}::jsonb,${before?JSON.stringify(before):null}::jsonb,${JSON.stringify(after)}::jsonb)`
 return {package:after}
 },{timeout:30000,maxWait:10000});return reply(result)
 }catch(e){if(e.message==='INVALID')return reply({code:'INVALID',error:'Bitte Setwerte und Produkte prüfen.'},400);if(e.message==='STALE_VERSION')return reply({code:'STALE_VERSION',error:'Set wurde geändert. Aktuellen Stand neu laden.'},409);if(e.message==='CONFLICT')return reply({code:'REQUEST_CONFLICT',error:'Die gespeicherte Anfrage stimmt nicht überein. Anfrage bleibt zur Klärung erhalten.'},409);if(e.code==='P2002'||e.meta?.code==='23505')return reply({code:'DUPLICATE_SLUG',error:'Dieser Slug ist bereits vergeben.'},409);return reply({error:'Speichern nicht bestätigt. Dieselbe Anfrage kann sicher erneut versucht werden.'},503)}
}
export const POST=write
export const PATCH=write

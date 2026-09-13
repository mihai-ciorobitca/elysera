import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {validateUpdate} from '../policy.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function PATCH(request,{params}){
 if(!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const {id}=await params;if(typeof id!=='string'||id.length>100)return reply({error:'Ungültige FAQ.'},400)
 const raw=await request.text();if(raw.length>15000)return reply({error:'Eingabe zu lang.'},400)
 let body;try{body=JSON.parse(raw)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 const data=validateUpdate(body);if(!data)return reply({error:'Bitte Frage, Antwort, Sprache, Status und Reihenfolge prüfen. Freigegebene FAQ benötigen eine Antwort.'},400)
 const entry=await prisma.$transaction(async tx=>{
 const [before]=await tx.$queryRaw`SELECT * FROM public."ElyseraFaqEntry" WHERE "id"=${id} FOR UPDATE`
 if(!before)return null;if(before.version!==body.expectedVersion)throw Error('FAQ_CHANGED')
 await tx.$executeRaw`UPDATE public."ElyseraFaqEntry" SET "question"=${data.question},"answer"=${data.answer},"locale"=${data.locale},"status"=${data.status},"sortOrder"=${data.sortOrder},"version"="version"+1,"updatedAt"=now(),"reviewedAt"=CASE WHEN ${data.status}='PENDING' THEN NULL ELSE now() END WHERE "id"=${id}`
 const [after]=await tx.$queryRaw`SELECT * FROM public."ElyseraFaqEntry" WHERE "id"=${id}`
 const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraFaqAudit" ("actorId","faqId","before","after") VALUES (${String(admin.id)},${id},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb) RETURNING "after"`
 if(!audit||audit.after.version!==after.version)throw Error('AUDIT_FAILED')
 return after
 },{timeout:30000,maxWait:10000});return entry?reply({entry}):reply({error:'FAQ nicht gefunden.'},404)
 }catch(e){return e.message==='FAQ_CHANGED'?reply({error:'Diese FAQ wurde inzwischen geändert. Dialog schließen und neu laden.',code:'FAQ_CHANGED'},409):reply({error:'Speichern wurde nicht bestätigt. Bitte neu laden und prüfen.'},503)}
}

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {validateCosts} from '@/lib/admin/reports-model.mjs'
export async function PUT(request){const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403);try{const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401);let body;try{const text=await request.text();if(text.length>4096)throw Error();body=validateCosts(JSON.parse(text))}catch{return reply({error:'Kosten müssen ganze Centbeträge oder unbekannt sein.'},400)}
 const config=await prisma.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('elysera-finance-config'))`
 const before=(await tx.$queryRaw`SELECT * FROM public."ElyseraFinanceConfig" WHERE "id"='current' FOR UPDATE`)[0]||null
 if((before?.version||0)!==body.expectedVersion)throw Error('CONFLICT')
 const json=JSON.stringify(body.costs)
 await tx.$executeRaw`INSERT INTO public."ElyseraFinanceConfig"("id","costs","version") VALUES ('current',${json}::jsonb,1) ON CONFLICT ("id") DO UPDATE SET "costs"=EXCLUDED."costs","version"=public."ElyseraFinanceConfig"."version"+1,"updatedAt"=now()`
 const after=(await tx.$queryRaw`SELECT * FROM public."ElyseraFinanceConfig" WHERE "id"='current'`)[0];if(!after||after.version!==body.expectedVersion+1)throw Error('READBACK')
 await tx.$executeRaw`INSERT INTO public."ElyseraFinanceAudit"("actorId","before","after") VALUES (${String(admin.id)},${before?JSON.stringify(before):null}::jsonb,${JSON.stringify(after)}::jsonb)`;return after
 },{timeout:30000,maxWait:10000});return reply({config})}catch(e){return reply({error:e.message==='CONFLICT'?'Kosten wurden geändert. Bericht neu laden und erneut prüfen.':'Speichern nicht bestätigt. Bericht vor erneutem Speichern neu laden.'},e.message==='CONFLICT'?409:503)}}

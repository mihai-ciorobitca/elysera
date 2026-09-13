import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {validateMembership} from '@/lib/admin/membership-policy.mjs'
export const dynamic='force-dynamic'
const reply=(b,s=200)=>NextResponse.json(b,{status:s,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){try{if(!await currentAdmin())return reply({error:'Bitte als Administrator anmelden.'},401);const id=new URL(request.url).searchParams.get('id');if(!id||id.length>100)return reply({error:'Ungültiger Kunde.'},400);const rows=await prisma.$queryRaw`SELECT p."userId",COALESCE(m.status,'NONE') AS status,COALESCE(m.version,0) AS version FROM public."ElyseraAccountProfile" p LEFT JOIN public."ElyseraMembership" m ON m."userId"=p."userId" WHERE p."userId"=${id}`;return rows.length?reply({membership:rows[0]}):reply({error:'ELYSERA-Profil nicht gefunden.'},404)}catch{return reply({error:'Mitgliedschaft konnte nicht geladen werden.'},503)}}
export async function POST(request){if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403);try{const actor=await currentAdmin();if(!actor)return reply({error:'Bitte als Administrator anmelden.'},401);const raw=await request.text();if(raw.length>4096)return reply({error:'Eingabe zu lang.'},400);let input;try{input=validateMembership(JSON.parse(raw))}catch(e){return reply({error:e.message},400)}
 const membership=await prisma.$transaction(async tx=>{
 const access=await tx.$queryRaw`SELECT a."userId" FROM public."ElyseraAdminAccess" a JOIN public."User" u ON u.id=a."userId" WHERE a."userId"=${actor.id} AND a.enabled=true AND u.blocked=false AND u."emailVerified"=true FOR SHARE`;if(!access.length)throw Error('NO_ACCESS');
 const profiles=await tx.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${input.customerId} FOR UPDATE`;if(!profiles.length)throw Error('NOT_FOUND');
 const rows=await tx.$queryRaw`SELECT status,version FROM public."ElyseraMembership" WHERE "userId"=${input.customerId}`;const before=rows[0]||{status:'NONE',version:0};if(before.version!==input.expectedVersion)throw Error('CONFLICT');if(before.status===input.status)return before;
 const changed=await tx.$queryRaw`INSERT INTO public."ElyseraMembership" ("userId",status,version,"updatedAt") VALUES (${input.customerId},${input.status},1,NOW()) ON CONFLICT ("userId") DO UPDATE SET status=EXCLUDED.status,version="ElyseraMembership".version+1,"updatedAt"=NOW() RETURNING status,version,"updatedAt"`;
 await tx.$executeRaw`INSERT INTO public."ElyseraCustomerAudit" ("actorId","customerId","before","after") VALUES (${actor.id},${input.customerId},${JSON.stringify({membership:before})}::jsonb,${JSON.stringify({membership:changed[0],reason:input.reason})}::jsonb)`;return changed[0]
 },{timeout:30000,maxWait:10000});return reply({membership})
 }catch(e){return reply({error:({CONFLICT:'Profil wurde inzwischen geändert. Aktuellen Status neu laden.',NOT_FOUND:'ELYSERA-Profil nicht gefunden.',NO_ACCESS:'Administratorzugriff nicht mehr verfügbar.'})[e.message]||'Speicherung nicht bestätigt. Bitte aktuellen Status neu laden.'},({CONFLICT:409,NOT_FOUND:404,NO_ACCESS:403})[e.message]||503)}}

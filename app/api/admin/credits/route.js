import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {parseGrant,grantElyseraCredits,readElyseraCreditBalance} from '@/lib/admin/credits.mjs'
export const dynamic='force-dynamic'
const reply=(b,status=200)=>NextResponse.json(b,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){try{
 if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const params=new URL(request.url).searchParams,q=params.get('q'),id=params.get('userId')
 if(q!==null){if(q.length>100)return reply({error:'Suchbegriff zu lang.'},400);const pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%';const recipients=await prisma.$queryRaw`SELECT u."id",u."firstName",u."secondName",u."email" FROM public."User" u JOIN public."ElyseraAccountProfile" p ON p."userId"=u."id" WHERE u."email" ILIKE ${pattern} OR concat_ws(' ',u."firstName",u."secondName") ILIKE ${pattern} ORDER BY u."email",u."id" LIMIT 21`;return reply({recipients:recipients.slice(0,20),limited:recipients.length>20})}
 if(id&&id.length>100)return reply({error:'Ungültiger Empfänger.'},400)
 const history=id?await prisma.$queryRaw`SELECT l.*,u."firstName",u."secondName" FROM public."ElyseraCreditLedger" l JOIN public."ElyseraAccountProfile" p ON p."userId"=l."userId" JOIN public."User" u ON u."id"=p."userId" WHERE l."userId"=${id} ORDER BY l."createdAt" DESC,l."id" LIMIT 501`:await prisma.$queryRaw`SELECT l.*,u."firstName",u."secondName" FROM public."ElyseraCreditLedger" l JOIN public."ElyseraAccountProfile" p ON p."userId"=l."userId" JOIN public."User" u ON u."id"=p."userId" ORDER BY l."createdAt" DESC,l."id" LIMIT 501`
 return reply({history:history.slice(0,500),limited:history.length>500,...(id?{balanceCents:await readElyseraCreditBalance(prisma,id)}:{})})
 }catch{return reply({error:'ELYSERA-Gutschriften nicht verfügbar. Bitte erneut versuchen.'},503)}}
export async function POST(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403)
 try{const admin=await currentAdmin();if(!admin)return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const text=await request.text();if(text.length>4096)return reply({error:'Ungültige Eingabe.',code:'INVALID'},400)
 let b;try{b=parseGrant(JSON.parse(text))}catch{return reply({error:'Empfänger, Centbetrag und Begründung prüfen.',code:'INVALID'},400)}
 return reply(await grantElyseraCredits(prisma,b,admin))
 }catch(e){if(e.message==='NOT_FOUND')return reply({error:'ELYSERA-Empfänger nicht gefunden.',code:'NOT_FOUND'},404);if(['CONFLICT','RECIPIENT_CHANGED'].includes(e.message))return reply({error:'Empfänger oder Buchungsauftrag wurde geändert. Bitte Angaben erneut prüfen.',code:e.message},409);return reply({error:'Keine Buchung bestätigt. Wiederholen verwendet denselben Buchungsauftrag und verhindert eine doppelte Gutschrift.'},503)}
}

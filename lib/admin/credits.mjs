export function parseGrant(b){
 if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).sort().join(',')!=='amountCents,email,idempotencyKey,reason,userId')throw Error('INVALID')
 if(typeof b.userId!=='string'||!b.userId||b.userId.length>100||typeof b.email!=='string'||!b.email||b.email.length>320||!Number.isSafeInteger(b.amountCents)||b.amountCents<1||b.amountCents>10000000||typeof b.reason!=='string'||b.reason.trim().length<3||b.reason.trim().length>240||typeof b.idempotencyKey!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.idempotencyKey))throw Error('INVALID')
 return {...b,reason:b.reason.trim()}
}
export function eurosToCents(value){if(!/^\d{1,6}([,.]\d{1,2})?$/.test(value))return null;const [whole,fraction='']=value.replace(',','.').split('.');const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));return cents>0&&cents<=10000000?cents:null}
export function matchesGrant(row,b,actorId){return row.userId===b.userId&&row.recipientEmail===b.email&&Number(row.amountCents)===b.amountCents&&row.reason===b.reason&&row.actorId===actorId}
// Brand ledger balance only. Throws on unavailable schema/profile; never substitutes global credits.
export async function readElyseraCreditBalance(tx,userId){
 const rows=await tx.$queryRaw`SELECT COALESCE(SUM(l."amountCents"),0)::text AS "balanceCents" FROM public."ElyseraAccountProfile" p LEFT JOIN public."ElyseraCreditLedger" l ON l."userId"=p."userId" WHERE p."userId"=${userId} GROUP BY p."userId"`
 if(!rows.length)throw Error('NOT_FOUND');const cents=Number(rows[0].balanceCents);if(!Number.isSafeInteger(cents))throw Error('BALANCE_RANGE');return cents
}
export async function grantElyseraCredits(db,b,admin){return db.$transaction(async tx=>{
 // Lock the request key first, including retries accidentally targeting another recipient.
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`elysera-credit:${b.idempotencyKey}`},0))`
 const profiles=await tx.$queryRaw`SELECT u."email" FROM public."ElyseraAccountProfile" p JOIN public."User" u ON u."id"=p."userId" WHERE p."userId"=${b.userId} FOR UPDATE OF p,u`
 if(!profiles.length)throw Error('NOT_FOUND')
 const previous=await tx.$queryRaw`SELECT * FROM public."ElyseraCreditLedger" WHERE "idempotencyKey"=${b.idempotencyKey}`
 if(previous.length){if(!matchesGrant(previous[0],b,String(admin.id)))throw Error('CONFLICT');return {grant:previous[0],balanceCents:await readElyseraCreditBalance(tx,b.userId),replayed:true}}
 if(profiles[0].email!==b.email)throw Error('RECIPIENT_CHANGED')
 const rows=await tx.$queryRaw`INSERT INTO public."ElyseraCreditLedger" ("userId","amountCents","reason","actorId","actorEmail","recipientEmail","idempotencyKey") VALUES (${b.userId},${b.amountCents},${b.reason},${String(admin.id)},${admin.email},${b.email},${b.idempotencyKey}) RETURNING *`
 await tx.$executeRaw`INSERT INTO public."ElyseraCreditAudit" ("ledgerId","actorId","payload") VALUES (${rows[0].id},${String(admin.id)},${JSON.stringify({userId:b.userId,email:b.email,amountCents:b.amountCents,reason:b.reason,type:'ADMIN_GRANT'})}::jsonb)`
 return {grant:rows[0],balanceCents:await readElyseraCreditBalance(tx,b.userId),replayed:false}
},{timeout:30000,maxWait:10000})}

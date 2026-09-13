import {randomUUID} from 'node:crypto'
import {FeedbackError,feedbackInput,feedbackTransition,feedbackProducts} from './feedback-policy.mjs'
export async function feedbackRead(db,admin,productId){
 if(!admin&&!feedbackProducts.includes(productId))throw new FeedbackError('Unbekanntes Produkt.',404)
 const rows=admin?await db.$queryRaw`SELECT f.*,u."firstName",u."email" FROM public."ElyseraProductFeedback" f JOIN public."ElyseraAccountProfile" p ON p."userId"=f."userId" JOIN public."User" u ON u."id"=f."userId" WHERE f."productId"=ANY(${feedbackProducts}::text[]) ORDER BY f."createdAt" DESC,f."id" LIMIT 501`:await db.$queryRaw`SELECT f."id",f."kind",f."body",f."rating",f."reply",f."verifiedPurchase",f."createdAt" FROM public."ElyseraProductFeedback" f JOIN public."ElyseraAccountProfile" p ON p."userId"=f."userId" JOIN public."User" u ON u."id"=f."userId" WHERE f."productId"=${productId} AND f."status" IN ('APPROVED','ANSWERED') ORDER BY f."createdAt" DESC,f."id" LIMIT 101`
 const limit=admin?500:100;return {entries:rows.slice(0,limit),limited:rows.length>limit,limit}
}
export async function feedbackMutate(db,actor,admin,raw){const input=feedbackInput(raw,admin);if(input.actorId!==actor.id)throw new FeedbackError('Anmeldung geändert.',403)
 return db.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.id+':feedback:'+input.requestId},0))`
 if(!admin){const [profile]=await tx.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${actor.id} FOR UPDATE`;if(!profile)throw new FeedbackError('ELYSERA-Konto erforderlich.',403)}
 const payload=JSON.stringify(Object.fromEntries(Object.entries({...input,admin}).sort(([a],[b])=>a.localeCompare(b))))
 const [prior]=await tx.$queryRaw`SELECT "payload","after" FROM public."ElyseraFeedbackAudit" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
 if(prior){if(JSON.stringify(Object.fromEntries(Object.entries(prior.payload).sort(([a],[b])=>a.localeCompare(b))))!==payload)throw new FeedbackError('Anfragekennung bereits verwendet.',409,'REQUEST_ID_CONFLICT');return {entry:prior.after,replayed:true}}
 let before=null,id=input.id
 if(admin){[before]=await tx.$queryRaw`SELECT * FROM public."ElyseraProductFeedback" WHERE "id"=${id} AND "productId"=ANY(${feedbackProducts}::text[]) FOR UPDATE`;feedbackTransition(before,input);await tx.$executeRaw`UPDATE public."ElyseraProductFeedback" SET "reply"=${input.reply},"status"=${input.status},"version"="version"+1,"updatedAt"=now() WHERE "id"=${id}`}
 else{
 // Only paid orders consisting entirely of this brand qualify. A pending order never earns a badge.
 const [purchase]=input.kind==='review'?await tx.$queryRaw`SELECT o."id" FROM public."Order" o WHERE o."userId"=${actor.id} AND o."status"::text IN ('PAID','PACKED','SHIPPED','DELIVERED') AND EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND i."productId"=${input.productId} AND i."quantity">0) AND NOT EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=o."id" AND (i."productId" IS NULL OR NOT(i."productId"=ANY(${feedbackProducts}::text[])))) LIMIT 1`:[]
 id=randomUUID();await tx.$executeRaw`INSERT INTO public."ElyseraProductFeedback"("id","productId","userId","kind","body","rating","status","verifiedPurchase") VALUES (${id},${input.productId},${actor.id},${input.kind},${input.body},${input.rating},${input.kind==='question'?'OPEN':'PENDING'},${!!purchase})`
 }
 const [entry]=await tx.$queryRaw`SELECT * FROM public."ElyseraProductFeedback" WHERE "id"=${id}`;if(!entry||admin&&entry.version!==before.version+1)throw Error('READBACK_FAILED')
 const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraFeedbackAudit"("feedbackId","actorId","requestId","payload","before","after") VALUES (${id},${actor.id},${input.requestId},${payload}::jsonb,${JSON.stringify(before)}::jsonb,${JSON.stringify(entry)}::jsonb) RETURNING "after"`;if(!audit||audit.after.id!==entry.id||audit.after.version!==entry.version)throw Error('AUDIT_FAILED')
 return {entry}
 },{timeout:30000,maxWait:10000})
}

import {OrderDetailsError,orderDetailsInput,orderDetailsScope,orderDetailsVersion,orderDetailFields} from './order-details-policy.mjs'
export async function orderDetailsRead(db,ids,id){
 const [row]=await db.$queryRaw`SELECT "id",xmin::text AS xmin,"status"::text AS status,"order-category"::text AS "orderCategory","admin-comment" AS "adminComment","shippingName","shippingAddress1","shippingAddress2","shippingCity","shippingState","shippingPostalCode","shippingCountry" FROM public."Order" WHERE "id"=${id} FOR UPDATE`
 if(!row)throw new OrderDetailsError('ELYSERA-Bestellung nicht gefunden.',404,'OUT_OF_SCOPE')
 const items=await db.$queryRaw`SELECT "productId" FROM public."OrderItem" WHERE "orderId"=${id} FOR SHARE`;orderDetailsScope(items,ids)
 return {...row,...Object.fromEntries(Object.keys(orderDetailFields).map(k=>[k,row[k]??'']))}
}
export async function orderDetailsMutate(db,actor,ids,raw){const input=orderDetailsInput(raw);if(input.actorId!==actor.id)throw new OrderDetailsError('Die Anmeldung hat sich geändert.',403,'ACTOR_CHANGED')
 return db.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.id+':order-details:'+input.requestId},0))`
 const before=await orderDetailsRead(tx,ids,input.orderId)
 const [existing]=await tx.$queryRaw`SELECT "request","after" FROM public."ElyseraOrderDetailsAudit" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
 if(existing){if(JSON.stringify(orderDetailsInput(existing.request))!==JSON.stringify(input))throw new OrderDetailsError('Anfragekennung bereits anders verwendet.',409,'REQUEST_ID_CONFLICT');return {state:before,applied:existing.after,replayed:true}}
 orderDetailsVersion(before,input)
 const categories=await tx.$queryRaw`SELECT unnest(enum_range(NULL::public."OrderCategory"))::text AS category`;if(!categories.some(c=>c.category===input.orderCategory))throw new OrderDetailsError('Kategorie wird vom System nicht unterstützt.',409,'INVALID_CATEGORY')
 await tx.$executeRaw`UPDATE public."Order" SET "shippingName"=${input.shippingName||null},"shippingAddress1"=${input.shippingAddress1||null},"shippingAddress2"=${input.shippingAddress2||null},"shippingCity"=${input.shippingCity||null},"shippingState"=${input.shippingState||null},"shippingPostalCode"=${input.shippingPostalCode||null},"shippingCountry"=${input.shippingCountry||null},"admin-comment"=${input.adminComment||null},"order-category"=${input.orderCategory}::public."OrderCategory" WHERE "id"=${input.orderId}`
 const after=await orderDetailsRead(tx,ids,input.orderId)
 if(after.status!==before.status||after.orderCategory!==input.orderCategory||Object.keys(orderDetailFields).some(k=>after[k]!==input[k]))throw Error('READBACK_FAILED')
 const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraOrderDetailsAudit"("orderId","actorId","requestId","request","before","after") VALUES (${input.orderId},${actor.id},${input.requestId},${JSON.stringify(input)}::jsonb,${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb) RETURNING "after"`
 if(!audit||['id','xmin','status','orderCategory',...Object.keys(orderDetailFields)].some(k=>audit.after[k]!==after[k]))throw Error('AUDIT_FAILED')
 return {state:after,replayed:false}
 },{timeout:30000,maxWait:10000})
}

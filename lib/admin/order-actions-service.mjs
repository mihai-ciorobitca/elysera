import {OrderActionError,orderActionInput,orderActionScope,orderActionVersion,orderTransitions,orderPaymentAmount} from './order-actions-policy.mjs'
export async function orderActionRead(db,ids,id,lock=false){
 const rows=lock?await db.$queryRaw`SELECT "id","status"::text AS status,xmin::text AS xmin,"total","coupon-eur" AS discount,"outstandingEur","paidAt",to_jsonb("Order")->>'trackingNumber' AS "legacyTrackingNumber",to_jsonb("Order")->>'trackingCarrier' AS "legacyTrackingCarrier" FROM public."Order" WHERE "id"=${id} FOR UPDATE`:await db.$queryRaw`SELECT "id","status"::text AS status,xmin::text AS xmin,"total","coupon-eur" AS discount,"outstandingEur","paidAt",to_jsonb("Order")->>'trackingNumber' AS "legacyTrackingNumber",to_jsonb("Order")->>'trackingCarrier' AS "legacyTrackingCarrier" FROM public."Order" WHERE "id"=${id}`
 if(!rows.length)throw new OrderActionError('ELYSERA-Bestellung nicht gefunden.',404)
 const items=lock?await db.$queryRaw`SELECT "productId" FROM public."OrderItem" WHERE "orderId"=${id} FOR SHARE`:await db.$queryRaw`SELECT "productId" FROM public."OrderItem" WHERE "orderId"=${id}`
 orderActionScope(items,ids)
 const [ops]=await db.$queryRaw`SELECT "version","trackingNumber","trackingCarrier","note" FROM public."ElyseraOrderOperations" WHERE "orderId"=${id}`
 return {...rows[0],outstanding:rows[0].outstandingEur,version:ops?.version??0,trackingNumber:ops?.trackingNumber??rows[0].legacyTrackingNumber??'',trackingCarrier:ops?.trackingCarrier??rows[0].legacyTrackingCarrier??'',note:ops?.note??'',transitions:orderTransitions[rows[0].status]??[]}
}
export async function orderActionMutate(db,actor,ids,raw){const input=orderActionInput(raw);if(input.actorId!==actor.id)throw new OrderActionError('Die Anmeldung hat sich geändert.',403,'ACTOR_CHANGED')
 return db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.id+':orders:'+input.requestId},0))`
  const [access]=await tx.$queryRaw`SELECT a."enabled",u."blocked",u."emailVerified",u."email",u."supabaseUserId"::text AS "supabaseUserId" FROM public."ElyseraAdminAccess" a JOIN public."User" u ON u."id"=a."userId" WHERE a."userId"=${actor.id} FOR SHARE OF a,u`;
  if(!access?.enabled||access.blocked||!access.emailVerified||!actor.supabaseUserId||access.supabaseUserId!==actor.supabaseUserId||String(access.email).toLowerCase()!==String(actor.email).toLowerCase())throw new OrderActionError("Administrator-Anmeldung erneut erforderlich.",401,"AUTH_REQUIRED");
  const before=await orderActionRead(tx,ids,input.orderId,true)
  const [existing]=await tx.$queryRaw`SELECT "request","after" FROM public."ElyseraOrderAudit" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
  if(existing){if(JSON.stringify(orderActionInput(existing.request))!==JSON.stringify(input))throw new OrderActionError('Anfragekennung bereits anders verwendet.',409,'REQUEST_ID_CONFLICT');return {state:before,applied:existing.after,replayed:true}}
  orderActionVersion(before,input)
  const markingPaid=input.status==='PAID'&&before.status!=='PAID';
  if(markingPaid)orderPaymentAmount(before);
  const enums=await tx.$queryRaw`SELECT unnest(enum_range(NULL::public."OrderStatus"))::text AS status`
  if(!enums.some(e=>e.status===input.status))throw new OrderActionError('Status wird vom System nicht unterstützt.',409)
  if(markingPaid)await tx.$executeRaw`UPDATE public."Order" SET "status"='PAID'::public."OrderStatus","paidAt"=now(),"outstandingEur"=0 WHERE "id"=${input.orderId}`
  else if(input.status!==before.status)await tx.$executeRaw`UPDATE public."Order" SET "status"=${input.status}::public."OrderStatus" WHERE "id"=${input.orderId}`
  await tx.$executeRaw`INSERT INTO public."ElyseraOrderOperations"("orderId","trackingNumber","trackingCarrier","note") VALUES (${input.orderId},${input.trackingNumber},${input.trackingCarrier},${input.note}) ON CONFLICT ("orderId") DO UPDATE SET "version"="ElyseraOrderOperations"."version"+1,"trackingNumber"=EXCLUDED."trackingNumber","trackingCarrier"=EXCLUDED."trackingCarrier","note"=EXCLUDED."note","updatedAt"=now()`
  const after=await orderActionRead(tx,ids,input.orderId)
  if(after.status!==input.status||after.version!==before.version+1||after.trackingNumber!==input.trackingNumber||after.trackingCarrier!==input.trackingCarrier||after.note!==input.note)throw Error('READBACK_FAILED')
  if(markingPaid&&(!after.paidAt||Number(after.outstandingEur)!==0))throw Error("PAYMENT_READBACK_FAILED");
  const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraOrderAudit"("orderId","actorId","requestId","request","before","after") VALUES (${input.orderId},${actor.id},${input.requestId},${JSON.stringify(input)}::jsonb,${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb) RETURNING "after"`
  if(audit?.after?.version!==after.version)throw Error('AUDIT_FAILED')
  return {state:after,replayed:false}
 },{timeout:30000,maxWait:10000})
}

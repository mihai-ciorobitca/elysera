import {productContentIds} from '../product-content.mjs'
import {ProductContentError,productContentScope,productContentState,productContentInput} from './product-content-policy.mjs'
export async function readProductContent(db){const products=await db.$queryRaw`SELECT "id","name" FROM public."Products" WHERE "id"=ANY(${productContentIds}::text[])`;const rows=await db.$queryRaw`SELECT "productId","version","content" FROM public."ElyseraProductContent" WHERE "productId"=ANY(${productContentIds}::text[])`;return productContentIds.map(id=>productContentState(id,rows.find(r=>r.productId===id),products.find(p=>p.id===id)?.name??null))}
export async function readLockedProductContent(db,id){productContentScope(id);const [product]=await db.$queryRaw`SELECT "id","name" FROM public."Products" WHERE "id"=${id} FOR UPDATE`;if(!product)throw new ProductContentError('ELYSERA-Produkt nicht gefunden.',404,'OUT_OF_SCOPE');const [row]=await db.$queryRaw`SELECT "productId","version","content" FROM public."ElyseraProductContent" WHERE "productId"=${id} FOR UPDATE`;return productContentState(id,row,product.name)}
export async function mutateProductContent(db,actor,raw){const input=productContentInput(raw);if(actor.id!==input.actorId)throw new ProductContentError('Die Anmeldung hat sich geändert.',403,'ACTOR_CHANGED')
 return db.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.id+':product-content:'+input.requestId},0))`
 const before=await readLockedProductContent(tx,input.productId)
 const [existing]=await tx.$queryRaw`SELECT "request","after" FROM public."ElyseraProductContentAudit" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
 if(existing){if(JSON.stringify(productContentInput(existing.request))!==JSON.stringify(input))throw new ProductContentError('Anfragekennung bereits anders verwendet.',409,'REQUEST_ID_CONFLICT');return {product:before,applied:existing.after,replayed:true}}
 if(before.version!==input.expectedVersion||before.snapshot!==input.expectedSnapshot)throw new ProductContentError('Produkttexte wurden geändert. Aktuellen Stand laden und erneut prüfen.',409,'STALE_VERSION')
 await tx.$executeRaw`INSERT INTO public."ElyseraProductContent"("productId","content") VALUES (${input.productId},${JSON.stringify(input.content)}::jsonb) ON CONFLICT ("productId") DO UPDATE SET "content"=EXCLUDED."content","version"="ElyseraProductContent"."version"+1,"updatedAt"=now()`
 const after=await readLockedProductContent(tx,input.productId)
 if(after.version!==before.version+1||JSON.stringify(after.content)!==JSON.stringify(input.content))throw Error('READBACK_FAILED')
 const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraProductContentAudit"("productId","actorId","requestId","request","before","after") VALUES (${input.productId},${actor.id},${input.requestId},${JSON.stringify(input)}::jsonb,${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb) RETURNING "after"`
 if(audit?.after?.version!==after.version||audit.after.snapshot!==after.snapshot)throw Error('AUDIT_FAILED')
 return {product:after,replayed:false}
 },{timeout:30000,maxWait:10000})
}

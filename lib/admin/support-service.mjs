import {randomUUID} from 'node:crypto'
import {SupportError,supportInput,supportAccess,supportVersion} from './support-policy.mjs'
export async function supportRead(db,actor,admin,id){
 if(id){const [ticket]=admin?await db.$queryRaw`SELECT t.*,u."email",u."firstName" FROM public."ElyseraSupportTicket" t JOIN public."ElyseraAccountProfile" p ON p."userId"=t."userId" JOIN public."User" u ON u."id"=p."userId" WHERE t."id"=${id}`:await db.$queryRaw`SELECT * FROM public."ElyseraSupportTicket" WHERE "id"=${id}`;supportAccess(ticket,actor,admin)
 const messages=await db.$queryRaw`SELECT "id","sender","body","createdAt" FROM public."ElyseraSupportMessage" WHERE "ticketId"=${id} ORDER BY "createdAt" DESC,"id" DESC LIMIT 2001`;return {ticket,messages:messages.slice(0,2000).reverse(),messagesLimited:messages.length>2000}}
 const tickets=admin?await db.$queryRaw`SELECT t.*,u."email",u."firstName" FROM public."ElyseraSupportTicket" t JOIN public."ElyseraAccountProfile" p ON p."userId"=t."userId" JOIN public."User" u ON u."id"=p."userId" ORDER BY t."updatedAt" DESC LIMIT 1001`:await db.$queryRaw`SELECT * FROM public."ElyseraSupportTicket" WHERE "userId"=${actor.id} ORDER BY "updatedAt" DESC LIMIT 1001`
 return {tickets:tickets.slice(0,1000),limited:tickets.length>1000}
}
export async function supportMutate(db,actor,admin,raw){const input=supportInput(raw,admin)
 return db.$transaction(async tx=>{
 let ticket,before=null
 if(['create','reply'].includes(input.action))await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${actor.id+':'+input.requestId},0))`
 if(input.action==='create'){
 const profiles=await tx.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${actor.id} FOR UPDATE`;if(!profiles.length)throw new SupportError('ELYSERA-Konto erforderlich.',403,'MEMBERSHIP_REQUIRED')
 }else{[ticket]=await tx.$queryRaw`SELECT * FROM public."ElyseraSupportTicket" WHERE "id"=${input.ticketId} FOR UPDATE`;supportAccess(ticket,actor,admin);before=ticket}
 if(['create','reply'].includes(input.action)){
 const [existing]=await tx.$queryRaw`SELECT * FROM public."ElyseraSupportMessage" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
 if(existing){if(existing.body!==input.body||(input.action==='reply'&&existing.ticketId!==ticket.id))throw new SupportError('Anfragekennung bereits verwendet.',409,'REQUEST_ID_CONFLICT');const result=await supportRead(tx,actor,admin,existing.ticketId);if(input.action==='create'&&result.ticket.subject!==input.subject)throw new SupportError('Anfragekennung bereits verwendet.',409,'REQUEST_ID_CONFLICT');return {...result,replayed:true}}
 }
 if(ticket)supportVersion(ticket,input)
 if(input.action==='create'){const id=randomUUID();[ticket]=await tx.$queryRaw`INSERT INTO public."ElyseraSupportTicket"("id","userId","subject") VALUES (${id},${actor.id},${input.subject}) RETURNING *`}
 if(['create','reply'].includes(input.action)){
 if(ticket.archivedAt)throw new SupportError('Archiviertes Ticket zuerst wiederherstellen.',409,'ARCHIVED')
 await tx.$executeRaw`INSERT INTO public."ElyseraSupportMessage"("id","ticketId","actorId","sender","body","requestId") VALUES (${randomUUID()},${ticket.id},${actor.id},${admin?'staff':'user'},${input.body},${input.requestId})`
 }
 if(input.action==='archive'&&ticket.status!=='resolved')throw new SupportError('Nur gelöste Tickets können archiviert werden.',409)
 if(input.action==='status'&&ticket.archivedAt)throw new SupportError('Ticket zuerst wiederherstellen.',409)
 const status=input.action==='status'?input.status:(input.action==='reply'&&admin&&ticket.status==='open'?'in_progress':ticket.status)
 const archived=input.action==='archive'?new Date():input.action==='restore'?null:ticket.archivedAt
 if(input.action!=='create')await tx.$executeRaw`UPDATE public."ElyseraSupportTicket" SET "status"=${status},"archivedAt"=${archived},"version"="version"+1,"updatedAt"=now() WHERE "id"=${ticket.id}`
 const result=await supportRead(tx,actor,admin,ticket.id)
 const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraSupportAudit"("ticketId","actorId","action","before","after") VALUES (${ticket.id},${actor.id},${input.action},${JSON.stringify(before)}::jsonb,${JSON.stringify(result.ticket)}::jsonb) RETURNING "after"`
 if(!audit||audit.after.version!==result.ticket.version)throw Error('AUDIT_FAILED')
 return result
 },{timeout:30000,maxWait:10000})
}

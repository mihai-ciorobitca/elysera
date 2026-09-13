import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {supportMutate,supportRead} from '../lib/admin/support-service.mjs'
import {supportInput,supportAccess} from '../lib/admin/support-policy.mjs'
import {supportHttpCore} from '../lib/admin/support-http-core.mjs'
import {sameOrigin} from '../lib/auth/policy.mjs'
test('HTTP executable auth and origin boundaries',async()=>{
 let reads=0,writes=0,principal=null,member=false
 const deps={prisma:{$queryRaw:async()=>member?[{userId:'owner'}]:[]},currentAdmin:async()=>principal,currentUser:async()=>principal,sameOrigin,reply:(body,status=200)=>({body,status}),supportRead:async()=>{reads++;return{}},supportMutate:async()=>{writes++;return{}}}
 const get=()=>new Request('https://elysera.test/api/account/support')
 const post=(origin='https://elysera.test')=>new Request('https://elysera.test/api/account/support',{method:'POST',headers:{origin},body:JSON.stringify({actorId:'owner'})})
 assert.equal((await supportHttpCore(get(),true,false,deps)).status,401)
 assert.equal((await supportHttpCore(get(),false,false,deps)).status,401)
 principal={id:'owner'}
 assert.equal((await supportHttpCore(post('https://evil.test'),true,true,deps)).status,403)
 assert.equal((await supportHttpCore(get(),false,false,deps)).status,403)
 assert.equal(reads,0);assert.equal(writes,0);member=true
 assert.equal((await supportHttpCore(get(),false,false,deps)).status,200)
 assert.equal(reads,1)
 principal={id:'changed'};assert.equal((await supportHttpCore(post(),false,true,deps)).status,403);assert.equal(writes,0)
})
function database({auditFails=false}={}){
 let state={tickets:[{id:'ticket1',userId:'owner',subject:'Help',status:'open',version:1,archivedAt:null}],messages:[],audits:[]}
 const db={get state(){return state},async $transaction(fn,options){assert.equal(options.timeout,30000);const backup=structuredClone(state);try{return await fn(db)}catch(e){state=backup;throw e}},async $queryRaw(parts,...v){const sql=parts.join('?');assert.ok(!/support_tickets|support_messages/.test(sql),'must never address shared support tables');if(sql.includes('INSERT INTO public."ElyseraSupportAudit"')){if(auditFails)throw Error('audit unavailable');const after=JSON.parse(v[4]);state.audits.push(after);return [{after}]}
 if(sql.includes('ElyseraAccountProfile')&&!sql.includes('ElyseraSupportTicket'))return [{userId:'owner'}]
 if(sql.includes('ElyseraSupportTicket'))return state.tickets.filter(t=>t.id===v[0])
 if(sql.includes('ElyseraSupportMessage'))return sql.includes('"actorId"')?state.messages.filter(m=>m.actorId===v[0]&&m.requestId===v[1]):state.messages.filter(m=>m.ticketId===v[0]);throw Error(sql)},async $executeRaw(parts,...v){const sql=parts.join('?');if(sql.includes('pg_advisory_xact_lock'))return 1;if(sql.includes('INSERT INTO')){state.messages.push({id:v[0],ticketId:v[1],actorId:v[2],sender:v[3],body:v[4],requestId:v[5]});return 1}if(sql.includes('UPDATE')){const t=state.tickets.find(t=>t.id===v[2]);Object.assign(t,{status:v[0],archivedAt:v[1],version:t.version+1});return 1}throw Error(sql)}};return db
}
const reply={action:'reply',ticketId:'ticket1',expectedVersion:1,body:'Test reply',requestId:'request-123456789012345'}
test('customer cannot use admin actions',()=>assert.throws(()=>supportInput({...reply,action:'status',status:'resolved'},false),e=>e.status===403))
test('other user cannot read or reply',async()=>{const db=database();await assert.rejects(supportRead(db,{id:'other'},false,'ticket1'),e=>e.status===404);await assert.rejects(supportMutate(db,{id:'other'},false,reply),e=>e.status===404);assert.equal(db.state.messages.length,0)})
test('stale version refuses mutation',async()=>{const db=database();await assert.rejects(supportMutate(db,{id:'admin'},true,{...reply,expectedVersion:2}),e=>e.status===409);assert.equal(db.state.messages.length,0)})
test('reply retry after reload returns existing message despite stale version',async()=>{const db=database();await supportMutate(db,{id:'admin'},true,reply);const result=await supportMutate(db,{id:'admin'},true,JSON.parse(JSON.stringify(reply)));assert.equal(result.replayed,true);assert.equal(db.state.messages.length,1);assert.equal(db.state.audits.length,1);assert.equal(result.ticket.status,'in_progress');assert.equal(result.ticket.version,2)})
test('idempotency key cannot be used for changed text',async()=>{const db=database();await supportMutate(db,{id:'admin'},true,reply);await assert.rejects(supportMutate(db,{id:'admin'},true,{...reply,body:'different'}),e=>e.status===409)})
test('audit failure rolls back reply and status',async()=>{const db=database({auditFails:true});await assert.rejects(supportMutate(db,{id:'admin'},true,reply));assert.equal(db.state.messages.length,0);assert.equal(db.state.tickets[0].status,'open');assert.equal(db.state.tickets[0].version,1)})
test('only resolved tickets archive; restore is versioned',async()=>{const db=database();await assert.rejects(supportMutate(db,{id:'admin'},true,{...reply,action:'archive'}),e=>e.status===409);await supportMutate(db,{id:'admin'},true,{...reply,action:'status',status:'resolved'});await supportMutate(db,{id:'admin'},true,{...reply,action:'archive',expectedVersion:2});assert.ok(db.state.tickets[0].archivedAt);await supportMutate(db,{id:'admin'},true,{...reply,action:'restore',expectedVersion:3});assert.equal(db.state.tickets[0].archivedAt,null);assert.equal(db.state.tickets[0].version,4)})
test('HTTP auth, membership, origin, own table constraints remain explicit',async()=>{const http=await readFile(new URL('../lib/admin/support-http-core.mjs',import.meta.url),'utf8');assert.match(http,/currentAdmin\(\):currentUser\(\)/);assert.match(http,/if\(!actor\).*401/);assert.match(http,/sameOrigin\(request\)/);assert.match(http,/ElyseraAccountProfile/);const sql=await readFile(new URL('../migrations/20260913_elysera_support.sql',import.meta.url),'utf8');assert.match(sql,/REFERENCES public\."ElyseraAccountProfile"/);assert.equal((sql.match(/ENABLE ROW LEVEL SECURITY/g)||[]).length,3);assert.match(sql,/UNIQUE\("actorId","requestId"\)/)})

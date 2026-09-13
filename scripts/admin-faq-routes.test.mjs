import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {validateUpdate} from '../app/api/admin/faqs/policy.mjs'
const before={id:'elysera-test',question:'Frage?',answer:'Bisherige Antwort',locale:'de',status:'PENDING',sortOrder:0,version:1}
const changes={question:'Neue Frage?',answer:'Neue Antwort',locale:'de',status:'APPROVED',sortOrder:0}
const after={...before,...changes,version:2}
function harness(path,{admin=true,origin=true,missing=false,stale=false,auditFailure=false}={}){
 const evidence={queries:[],writes:0,committed:false,rolledBack:false}
 const tx={$queryRaw:async(strings,...values)=>{const sql=strings.join('?');evidence.queries.push({sql,values});if(sql.startsWith('INSERT')){if(auditFailure)throw Error('private database error');return[{after}]}
 return missing?[]:[evidence.writes?after:{...before,version:stale?9:1}]},$executeRaw:async()=>{evidence.writes++;return 1}}
 const prisma={...tx,$transaction:async fn=>{try{const r=await fn(tx);evidence.committed=true;return r}catch(e){evidence.rolledBack=true;throw e}}}
 const context={NextResponse:{json:(body,options={})=>({body,status:options.status||200,headers:options.headers})},prisma,currentAdmin:async()=>admin?{id:'test-admin'}:null,sameOrigin:()=>origin,validateUpdate,URL}
 vm.createContext(context);vm.runInContext(readFileSync(path,'utf8').replace(/^import .*$/mg,'').replaceAll('export ','')+';this.handler=typeof PATCH==="function"?PATCH:GET',context)
 return{call:context.handler,evidence}
}
const patchPath='app/api/admin/faqs/[id]/route.js'
const request=()=>({text:async()=>JSON.stringify({changes,expectedVersion:1})})
const params={params:Promise.resolve({id:before.id})}
test('FAQ anonymous and cross-origin writes cannot query data',async()=>{for(const settings of[{admin:false},{origin:false}]){const h=harness(patchPath,settings),r=await h.call(request(),params);assert.ok([401,403].includes(r.status));assert.equal(h.evidence.queries.length,0)}})
test('missing and stale FAQ never update',async()=>{for(const [settings,status]of[[{missing:true},404],[{stale:true},409]]){const h=harness(patchPath,settings),r=await h.call(request(),params);assert.equal(r.status,status);assert.equal(h.evidence.writes,0)}})
test('FAQ persists readback and audit in one scoped transaction',async()=>{const h=harness(patchPath),r=await h.call(request(),params);assert.equal(r.status,200);assert.equal(r.body.entry.version,2);assert.equal(r.body.entry.answer,after.answer);assert.ok(h.evidence.committed);assert.match(h.evidence.queries[0].sql,/public\."ElyseraFaqEntry".*FOR UPDATE/);assert.match(h.evidence.queries.at(-1).sql,/public\."ElyseraFaqAudit"/)})
test('audit failure rolls back and redacts database error',async()=>{const h=harness(patchPath,{auditFailure:true}),r=await h.call(request(),params);assert.equal(r.status,503);assert.ok(h.evidence.rolledBack);assert.equal(h.evidence.committed,false);assert.doesNotMatch(JSON.stringify(r),/private database/)})
test('anonymous FAQ admin listing never queries',async()=>{const h=harness('app/api/admin/faqs/route.js',{admin:false}),r=await h.call();assert.equal(r.status,401);assert.equal(h.evidence.queries.length,0)})
test('public FAQ query selects only approved localized question and answer',async()=>{const h=harness('app/api/faqs/route.js');const r=await h.call({url:'http://localhost:3022/api/faqs?locale=en'});assert.equal(r.status,200);assert.match(h.evidence.queries[0].sql,/SELECT "question","answer" FROM public\."ElyseraFaqEntry" WHERE "status"='APPROVED' AND "locale"=/);assert.equal(h.evidence.queries[0].values[0],'en')})

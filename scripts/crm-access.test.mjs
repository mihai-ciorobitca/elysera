import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
function load(file,scope,expose){
 const source=readFileSync(file,'utf8').replace(/^import .*$/mg,'').replaceAll('export ','')
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText
 const context=vm.createContext({...scope,Date,Error,URL,Buffer,process})
 vm.runInContext(js+`;this.result={${expose}}`,context)
 return context.result
}
const eligible={id:'member',role:'AFFILIATE',membership:'DIAMOND',blocked:false,membership_expires_at:null,crmMembership:{enabled:true,updatedAt:new Date()}}
function access({admin=null,principal={id:'member'},row=eligible}={}){
 let queries=0
 const rules=load('lib/diamond-club-access.ts',{},'canAccessDiamondClub,isDiamondClubCandidateRole')
 const f=load('lib/diamond-crm-server.ts',{...rules,currentAdmin:async()=>admin,currentUser:async()=>principal,prisma:{user:{findUnique:async()=>{queries++;return row}}}},'crmIdentity')
 return {...f,queries:()=>queries}
}
test('only the native Elysera admin principal grants CRM administrator access',async()=>{
 const h=access({admin:{id:'elysera-granted-admin',role:'ADMIN'}})
 const identity=await h.crmIdentity();assert.equal(identity.admin,true);assert.equal(identity.userId,'elysera-granted-admin');assert.equal(h.queries(),0)
})
test('anonymous, blocked, revoked and expired accounts cannot read leads',async()=>{
 for(const [options,status]of [[{principal:null},401],[{row:{...eligible,blocked:true}},403],[{row:{...eligible,crmMembership:{enabled:false}}},403],[{row:{...eligible,membership_expires_at:new Date(0)}},403]]){
  await assert.rejects(access(options).crmIdentity(),e=>e.status===status)
 }
})
test('an approved active member receives only a member identity',async()=>{const identity=await access().crmIdentity();assert.equal(identity.admin,false);assert.equal(identity.userId,'member')})
test('login endpoint redirects anonymous users to native login and signed-in users to CRM',async()=>{
 const helpers=load('lib/crm-login.ts',{},'crmReturnPath,crmSignInPath')
 for(const signedIn of [false,true])for(const path of ['/admin/crm','/dashboard/crm']){
  const principal=async()=>signedIn?{id:'member'}:null
  const {GET}=load('app/api/crm-auth/start/route.ts',{...helpers,currentAdmin:principal,currentUser:principal,NextResponse:{redirect:url=>({location:url.toString()}),json:()=>{throw Error('Unexpected failure')}}},'GET')
  const url=new URL('https://www.elysera.org/api/crm-auth/start');url.searchParams.set('returnTo',path)
  const response=await GET({url:url.toString(),nextUrl:url})
  assert.equal(response.location,'https://www.elysera.org'+(signedIn?path:helpers.crmSignInPath(path)))
 }
})

test('email draft caps requests and rechecks member ownership and do-not-contact status',async()=>{
 const identity={userId:'member',admin:false}
 let queries=0,where
 class CrmError extends Error {constructor(message,status=400){super(message);this.status=status}}
 const {POST}=load('app/api/diamond-crm/route.ts',{
  CrmError,isSameOriginMutation:()=>true,crmIdentity:async()=>identity,requireCrmAccess:async()=>identity,
  prisma:{crmLead:{findMany:async(args)=>{queries++;where=args.where;return [{id:'own',email:'lead@example.test',fullName:'Lead'}]}}},
  NextResponse:{json:(body,options)=>({body,status:options.status})},
 },'POST')
 const send=ids=>POST(new Request('https://www.elysera.org/api/diamond-crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'email-draft',ids})}))
 assert.equal((await send(Array.from({length:31},(_,i)=>String(i)))).status,400)
 assert.equal(queries,0)
 assert.equal((await send(['own'])).status,200)
 assert.equal(where.assignedToId,'member')
 assert.equal(where.status.not,'DO_NOT_CONTACT')
 assert.equal((await send(['own','foreign'])).status,409)
})

test('allocation persists across days, gates unfinished leads and supports targeted admin extras',async()=>{
 const rules=load('lib/diamond-crm.ts',{},'allocationBatchSize,CRM_BATCH_SIZE')
 let day='2026-09-15',locked=false
 const rows=Array.from({length:160},(_,i)=>({id:String(i),assignedToId:null,assignedDay:null,status:'NEW'}))
 const tx={
  $executeRaw:async()=>{locked=true},
  crmMember:{findMany:async({where})=>['member','other'].filter(id=>!where.userId||where.userId===id).map(userId=>({userId,user:{}}))},
  crmLead:{
   groupBy:async({where})=>{assert.ok(locked);assert.equal(where.assignedDay,undefined);return ['member','other'].map(id=>({assignedToId:id,_count:rows.filter(r=>r.assignedToId===id&&r.status===where.status).length}))},
   findMany:async({take})=>rows.filter(r=>!r.assignedToId&&!r.assignedDay&&r.status==='NEW').slice(0,take),
   updateMany:async({where,data})=>{let count=0;for(const row of rows)if(where.id.in.includes(row.id)&&!row.assignedToId){Object.assign(row,data);count++}return {count}}
  }
 }
 const {allocateCrmLeads}=load('lib/diamond-crm-server.ts',{...rules,crmDay:()=>day,isDiamondClubCandidateRole:()=>true,canAccessDiamondClub:()=>true,prisma:{$transaction:async f=>f(tx)}},'allocateCrmLeads')
 assert.equal((await allocateCrmLeads('member')).allocated,50)
 const original=rows.filter(r=>r.assignedToId==='member').map(r=>r.id)
 day='2026-09-16'
 assert.equal((await allocateCrmLeads('member')).allocated,0)
 assert.deepEqual(rows.filter(r=>r.assignedToId==='member').map(r=>r.id),original)
 rows.filter(r=>r.assignedToId==='member').forEach(r=>r.status='CONTACTED')
 assert.equal((await allocateCrmLeads('member')).allocated,50)
 assert.equal((await allocateCrmLeads('member')).allocated,0)
 assert.equal((await allocateCrmLeads('member',true)).allocated,50)
 assert.equal(rows.filter(r=>r.assignedToId==='member').length,150)
 assert.equal(rows.filter(r=>r.assignedToId==='other').length,0)
 assert.equal((await allocateCrmLeads()).allocated,10)
 assert.equal(rows.filter(r=>r.assignedToId==='other').length,10)
 assert.equal((await allocateCrmLeads('member',true)).allocated,0)
 rows.forEach(r=>Object.assign(r,{assignedToId:null,assignedDay:null,status:'NEW'}))
 assert.equal((await allocateCrmLeads('member',true,75)).allocated,75)
 await assert.rejects(allocateCrmLeads('member',true,100),e=>e.status===409)
 assert.equal(rows.filter(r=>r.assignedToId==='member').length,75)
 assert.equal((await allocateCrmLeads('member',true,7)).allocated,7)
 assert.equal(rows.filter(r=>r.assignedToId==='member').length,82)
 await assert.rejects(allocateCrmLeads('member',false,7))
})

test('member allocation cannot override completion or choose another member',async()=>{
 let calls=[];let identity={userId:'member',admin:false}
 class CrmError extends Error {constructor(message,status=400){super(message);this.status=status}}
 const {POST}=load('app/api/diamond-crm/route.ts',{CrmError,isSameOriginMutation:()=>true,crmIdentity:async()=>identity,requireCrmAccess:async()=>identity,allocateCrmLeads:async(...args)=>{calls.push(args);return {allocated:50}},NextResponse:{json:(body,options)=>({body,status:options.status})}},'POST')
 const send=body=>POST(new Request('https://www.elysera.org/api/diamond-crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'allocate',...body})}))
 assert.equal((await send({override:true})).status,403)
 assert.equal((await send({userId:'other'})).status,403)
 assert.equal((await send({quantity:75})).status,403)
 assert.equal(calls.length,0)
 assert.equal((await send({})).status,200)
 assert.deepEqual(calls.pop(),['member',false,undefined])
 identity={userId:'admin',admin:true}
 assert.equal((await send({override:true})).status,400)
 assert.equal((await send({userId:'other',override:true})).status,200)
 assert.deepEqual(calls.pop(),['other',true,undefined])
 for(const quantity of [0,-1,1.5,'75',2147483648]) assert.equal((await send({userId:'other',override:true,quantity})).status,400)
 assert.equal((await send({userId:'other',override:true,quantity:75})).status,200)
 assert.deepEqual(calls.pop(),['other',true,75])
})

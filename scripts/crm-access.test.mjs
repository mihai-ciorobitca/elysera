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

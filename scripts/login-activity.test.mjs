import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {recordFirstLogin} from '../lib/auth/login-activity.mjs'

const source=readFileSync(new URL('../lib/auth/server.js',import.meta.url),'utf8')
  .replace(/^import .*\r?\n/gm,'').replace(/export /g,'')
function harness({identity=true,mfa=true,eligible=true,admin=false,impersonating=false,returning=false}={}) {
  const recorded=[]
  const client={auth:{getUser:async()=>({data:{user:identity?{id:'auth',email:'test@example.test'}:null}}),mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{nextLevel:'aal2',currentLevel:mfa?'aal2':'aal1'}})}}}
  const db={$queryRaw:async()=>[{id:'actor',email:'test@example.test',adminAccess:admin,firstLoginAt:returning?'2026-09-01':null}]}
  const api=Function('prisma','recordFirstLogin','eligibleAccount','eligibleAdmin','cookies','createServerClient','authConfig','cookieOptions','impersonationCookie','impersonatedUser','headers',source+';return {principalFor,adminPrincipalFor,currentUser}')(
    db,async(_,id)=>recorded.push(id),()=>eligible,()=>admin,
    async()=>({get:()=>impersonating?{value:'token'}:null,getAll:()=>[]}),()=>client,
    ()=>({url:'https://example.test',key:'test'}),()=>({}), 'impersonation',
    async()=>({id:'target',impersonatedBy:'actor'}),async()=>new Map())
  return {api,client,recorded}
}
test('verified customer visit records activity; denied identity, MFA and business access do not',async()=>{
  for(const options of [{identity:false},{mfa:false},{eligible:false}]) {
    const h=harness(options)
    assert.equal(await h.api.principalFor(h.client),null)
    assert.deepEqual(h.recorded,[])
  }
  const h=harness();assert.equal((await h.api.principalFor(h.client)).id,'actor');assert.deepEqual(h.recorded,['actor'])
})
test('admin impersonation records only the actual admin, never the viewed customer',async()=>{
  const h=harness({admin:true,impersonating:true})
  assert.equal((await h.api.currentUser()).id,'target')
  assert.deepEqual(h.recorded,['actor'])
})
test('first-login write uses a conditional atomic upsert without changing contact version',async()=>{
  let query,values
  await recordFirstLogin({$executeRaw:async(s,...v)=>{query=s.join('?');values=v}},'customer')
  assert.deepEqual(values,['customer'])
  assert.match(query,/ON CONFLICT.*DO UPDATE/s)
  assert.match(query,/WHERE "ElyseraAccountProfile"\."firstLoginAt" IS NULL/)
  assert.doesNotMatch(query,/updatedAt|details/)
})

test('returning visits do not rewrite first login',async()=>{const h=harness({returning:true});assert.equal((await h.api.principalFor(h.client)).id,'actor');assert.deepEqual(h.recorded,[])})

import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {impersonationCookie,stopImpersonation,tokenHash} from '../lib/auth/impersonation.mjs'

function harness(route,{token='a'.repeat(64),dbFails=false,allowed=true}={}){
 const cookiesSet=[],queries=[],signouts=[]
 const jar={get:name=>name===impersonationCookie&&token?{value:token}:undefined,set:(...args)=>cookiesSet.push(args)}
 const prisma={$executeRaw:async(strings,...values)=>{queries.push({sql:strings.join('?'),values});if(dbFails)throw Error('database unavailable');return 1}}
 const source=readFileSync(new URL(route,import.meta.url),'utf8').replace(/^import .*$/gm,'').replaceAll('export ','')
 const method=route.includes('/admin/')?'DELETE':'POST'
 const handler=Function('NextResponse','cookies','prisma','authClient','sameOrigin','impersonationCookie','stopImpersonation',source+';return '+method)(
  {json:(body,options={})=>({body,status:options.status||200,headers:options.headers})},async()=>jar,prisma,
  async()=>({auth:{signOut:async options=>{signouts.push(options);return {error:null}}}}),()=>allowed,impersonationCookie,stopImpersonation)
 return {handler,cookiesSet,queries,signouts}
}
for(const route of ['../app/api/admin/impersonation/route.js','../app/api/auth/signout/route.js']){
 test(`${route}: exits impersonation and preserves admin auth`,async()=>{
  const h=harness(route),r=await h.handler({})
  assert.equal(r.status,200);assert.equal(r.body.redirect,'/admin/users')
  assert.deepEqual(h.queries[0].values,[tokenHash('a'.repeat(64))])
  assert.match(h.queries[0].sql,/"endedAt" IS NULL/)
  assert.equal(h.cookiesSet.length,1);assert.equal(h.cookiesSet[0][0],impersonationCookie)
  assert.equal(h.cookiesSet[0][1],'');assert.equal(h.cookiesSet[0][2].maxAge,0);assert.equal(h.cookiesSet[0][2].path,'/')
  assert.equal(h.signouts.length,0)
 })
 test(`${route}: database failure does not trap the admin`,async t=>{
  const log=t.mock.method(console,'error',()=>{})
  const h=harness(route,{dbFails:true}),r=await h.handler({})
  assert.equal(r.status,200);assert.equal(r.body.redirect,'/admin/users')
  assert.equal(h.cookiesSet[0][2].maxAge,0);assert.equal(h.signouts.length,0)
  assert.equal(log.mock.callCount(),1)
 })
 test(`${route}: rejects cross-origin requests without side effects`,async()=>{
  const h=harness(route,{allowed:false}),r=await h.handler({})
  assert.equal(r.status,403);assert.equal(h.cookiesSet.length,0);assert.equal(h.queries.length,0);assert.equal(h.signouts.length,0)
 })
}
test('stopping with no impersonation cookie remains idempotent',async()=>{
 const h=harness('../app/api/admin/impersonation/route.js',{token:null}),r=await h.handler({})
 assert.equal(r.status,200);assert.equal(h.queries.length,0);assert.equal(h.signouts.length,0)
})
test('regular signout still ends the local auth session',async()=>{
 const h=harness('../app/api/auth/signout/route.js',{token:null}),r=await h.handler({})
 assert.equal(r.status,200);assert.deepEqual(h.signouts,[{scope:'local'}]);assert.equal(h.cookiesSet.length,0)
})

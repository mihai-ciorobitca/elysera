import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
import {createHmac} from 'node:crypto'

test('token failures remain retryable, successful verification/reset consumes once, blocked accounts stay denied',async()=>{
 for(const kind of ['verify','reset']){
  let token=true,fail=true,blocked=false,writes=0,notices=0
  const user={id:'customer',email:'fixture@example.test',supabaseUserId:'identity',emailVerified:true,blocked:false,role:'USER'}
  const prisma={$transaction:async fn=>{
   const before=token
   try{return await fn({$queryRaw:async()=>token?[{...user,blocked}]:[],$executeRaw:async strings=>{const sql=strings.join('?');assert.match(sql,/public\./);if(sql.includes('DELETE'))token=false;else writes++;return 1}})}catch(e){token=before;throw e}
  }}
  let source=readFileSync('lib/auth/account-service.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','')
  source=source.replace(/function adminClient\(\)\{[^\n]+\}/,"function adminClient(){return provider}")
  const scope={prisma,tokenDigest:()=> 'elysera:test:digest',provider:{auth:{admin:{updateUserById:async()=>({error:fail?Error('provider unavailable'):null})}}},setSharedPassword:async()=>{if(fail)throw Error('provider unavailable');writes++},passwordNotice:async()=>{notices++;return true}}
  const api=vm.runInNewContext(source+'\n({verifyEmail,resetPassword})',scope)
  const perform=()=>kind==='verify'?api.verifyEmail('token'):api.resetPassword('token','new-fixture-password')
  await assert.rejects(perform(),/provider unavailable/);assert.equal(token,true)
  fail=false;blocked=true;assert.equal(await perform(),false);assert.equal(token,true)
  blocked=false;assert.ok(await perform());assert.equal(token,false);assert.equal(writes,1)
  assert.equal(await perform(),false);assert.equal(writes,1);assert.equal(notices,kind==='reset'?1:0)
 }
})

test('email-less verification/reset/OAuth requests never use a shared global customer bucket',async()=>{
 const keys=[]
 const source=readFileSync('lib/auth/rate-limit.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','')
 const fn=vm.runInNewContext(source+'\nloginRateLimit',{createHmac,process:{env:{VERCEL:'1',ELYSERA_RATE_LIMIT_SECRET:'test-only'}},prisma:{$queryRaw:async(strings,...values)=>{keys.push(values[0]);return [{count:1}]}}})
 for(const action of ['verify','reset','google']){
  keys.length=0
  for(let i=0;i<20;i++)assert.equal(await fn({headers:{get:()=>`192.0.2.${i}`} },'',action),true)
  assert.equal(keys.length,20);assert.equal(new Set(keys).size,20)
 }
 keys.length=0;await fn({headers:{get:()=> '192.0.2.1'}},'customer@example.test','signin');assert.equal(keys.length,2)
})

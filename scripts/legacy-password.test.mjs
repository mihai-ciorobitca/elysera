import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
import bcrypt from 'bcryptjs'

const password='fixture-current-password'
const hash=await bcrypt.hash(password,4)
function harness({user={},identity={},missing=false,duplicate=false,owner=false,createError=false}={}){
 const writes=[],created=[]
 const account={id:'customer',email:'member@example.test',password:hash,supabaseUserId:'identity',emailVerified:true,blocked:false,role:'USER',...user}
 const auth={id:'identity',email:account.email,encrypted_password:'stale',email_confirmed_at:new Date(),...identity}
 const tx={
  $queryRaw:async(strings)=>{const sql=strings.join('?');if(sql.includes('FROM auth.users'))return missing?[]:[auth];if(sql.includes('AND id<>'))return owner?[{id:'another'}]:[];return duplicate?[account,account]:[account]},
  $executeRaw:async(strings,...values)=>{writes.push({sql:strings.join('?'),values});return 1},
 }
 const createUser=async input=>{created.push(input);return createError?{error:{}}:{data:{user:{id:'new-identity'}}}}
 const context={bcrypt,Date,activateRegistration:async()=>false,prisma:{$transaction:async fn=>fn(tx)},adminClient:()=>({auth:{admin:{createUser}}})}
 const source=readFileSync('lib/auth/legacy-password.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','')
 const prepare=vm.runInNewContext(source+'\nprepareLegacyPassword',context)
 return {prepare,writes,created}
}
test('current PeptiKing password repairs stale provider hash without altering confirmation, bans or MFA',async()=>{
 const h=harness();assert.equal(await h.prepare('member@example.test',password),null)
 assert.equal(h.writes.length,1);assert.equal(h.writes[0].values[0],hash)
 assert.doesNotMatch(h.writes[0].sql,/email_confirmed|banned|mfa|identities/)
 assert.equal(h.created.length,0)
})
test('wrong old passwords, blocked, unverified, banned and conflicting identities cannot repair credentials',async()=>{
 for(const options of [{},{user:{blocked:true}},{user:{emailVerified:false}},{identity:{email:'other@example.test'}},{identity:{banned_until:new Date(Date.now()+60000)}},{identity:{email_confirmed_at:null}},{identity:{id:'different'}},{owner:true}]){
  const h=harness(options);const result=await h.prepare('member@example.test',Object.keys(options).length?password:'wrong-password')
  assert.ok(result?.code);assert.equal(h.writes.length,0);assert.equal(h.created.length,0)
 }
})
test('verified legacy-only customers are provisioned and linked after password proof',async()=>{
 const h=harness({missing:true,user:{supabaseUserId:null}})
 assert.equal(await h.prepare('member@example.test',password),null)
 assert.equal(h.created.length,1);assert.equal(h.created[0].email_confirm,true)
 assert.equal(h.writes.length,1);assert.match(h.writes[0].sql,/supabaseUserId/)
 const fail=harness({missing:true,user:{supabaseUserId:null},createError:true})
 await assert.rejects(fail.prepare('member@example.test',password),/CREATE_FAILED/);assert.equal(fail.writes.length,0)
})
test('matching hashes require no write; modern and staff accounts retain provider-only flow',async()=>{
 for(const options of [{identity:{encrypted_password:hash}},{user:{password:'!supabase-only:fixture'}},{user:{role:'ADMIN'}},{user:{role:'STAFF'}},{duplicate:true}]){
  const h=harness(options);assert.equal(await h.prepare('member@example.test',password),null);assert.equal(h.writes.length,0);assert.equal(h.created.length,0)
 }
 const dangling=harness({missing:true});assert.ok((await dangling.prepare('member@example.test',password))?.code);assert.equal(dangling.created.length,0)
})
test('shared password changes write identical hashes atomically and refuse ineligible accounts',async()=>{
 const source=readFileSync('lib/auth/shared-password.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','')
 for(const allowed of [true,false]){
  const writes=[];let transaction=false
  const db={$transaction:async fn=>{transaction=true;return fn({$queryRaw:async()=>allowed?[{id:'customer'}]:[],$executeRaw:async(strings,...values)=>{assert.equal(transaction,true);writes.push({sql:strings.join('?'),values});return 1}})}}
  const set=vm.runInNewContext(source+'\nsetSharedPassword',{bcrypt,prisma:db})
  const action=set({id:'customer',supabaseUserId:'identity'},password)
  if(!allowed){await assert.rejects(action,/UNAVAILABLE/);assert.equal(writes.length,0);continue}
  await action;assert.equal(writes.length,3);assert.equal(writes[0].values[0],writes[1].values[0]);assert.ok(await bcrypt.compare(password,writes[0].values[0]));assert.ok(!writes[0].values.includes(password));assert.match(writes[2].sql,/DELETE FROM auth.sessions WHERE user_id=/);assert.equal(writes[2].values[0],'identity')
 }
})

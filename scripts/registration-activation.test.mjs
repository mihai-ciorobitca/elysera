import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import bcrypt from 'bcryptjs'

const password='test-registration-password',hash=await bcrypt.hash(password,4);
const source=readFileSync('lib/auth/registration-activation.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','');
function activation({user={},missing=false,duplicate=false,fail=false}={}){
 const account={id:'customer',email:'signup@example.test',authEmail:'signup@example.test',password:hash,supabaseUserId:'identity',emailVerified:false,blocked:false,role:'USER',emailDeliveryStatus:'NONE',conflictingOwner:false,...user};
 const writes=[];let committed=false;
 const tx={$queryRaw:async strings=>{const sql=strings.join('?');assert.match(sql,/JOIN public\."ElyseraPartnerProfile"/);assert.match(sql,/JOIN public\."ElyseraAccountProfile"/);assert.match(sql,/JOIN auth.users/);assert.match(sql,/FOR UPDATE OF u,a/);return missing?[]:duplicate?[account,account]:[account]},$executeRaw:async(strings,...values)=>{writes.push({sql:strings.join('?'),values});if(fail&&writes.length===2)throw Error('DB unavailable');return 1}};
 const prisma={$transaction:async fn=>{try{const result=await fn(tx);committed=true;return result}catch(error){writes.length=0;throw error}}};
 return {activate:vm.runInNewContext(source+'\nactivateRegistration',{bcrypt,prisma,Date}),writes,isCommitted:()=>committed};
}

test('pending ELYSERA registration activates both records atomically using its original password',async()=>{
 const h=activation();assert.equal(await h.activate('signup@example.test',password),true);assert.equal(h.isCommitted(),true);assert.equal(h.writes.length,3);
 assert.match(h.writes[0].sql,/email_confirmed_at/);assert.match(h.writes[1].sql,/"emailVerified"=true/);assert.match(h.writes[2].sql,/elysera:verify:/);
 assert.doesNotMatch(h.writes.map(x=>x.sql).join(' '),/SET .*password|banned_until=|emailDeliveryStatus.*SAFE|mfa/);
});
test('activation rejects wrong password, unrelated accounts, conflicting identities and restrictions',async()=>{
 for(const options of [{missing:true},{duplicate:true},{user:{blocked:true}},{user:{role:'ADMIN'}},{user:{role:'STAFF'}},{user:{emailDeliveryStatus:'BOUNCED'}},{user:{conflictingOwner:true}},{user:{authEmail:'other@example.test'}},{user:{banned_until:new Date(Date.now()+60000)}},{user:{password:'!supabase-only'}},{user:{emailVerified:true}}]){
  const h=activation(options);assert.equal(await h.activate('signup@example.test',password),false);assert.equal(h.writes.length,0);
 }
 const h=activation();assert.equal(await h.activate('signup@example.test','incorrect'),false);assert.equal(h.writes.length,0);
});
test('activation database failure rolls back both confirmation flags',async()=>{
 const h=activation({fail:true});await assert.rejects(h.activate('signup@example.test',password),/DB unavailable/);assert.equal(h.writes.length,0);assert.equal(h.isCommitted(),false);
});

function registration({existing=null,insertError=false,activateResult=true,providerError=null}={}){
 let mailCalls=0;const created=[],deleted=[],inserted=[],activated=[];
 let code=readFileSync('lib/auth/account-service.js','utf8').replace(/^import .*$/gm,'').replaceAll('export ','');
 code=code.replace(/function adminClient\(\)\{[^\n]+\}/,'function adminClient(){return provider}');
 const scope={bcrypt,randomUUID:()=> 'customer',prisma:{$queryRaw:async()=>existing?[existing]:[]},provider:{auth:{admin:{createUser:async data=>{created.push(data);return providerError?{error:providerError}:{data:{user:{id:'identity'}}}},deleteUser:async id=>deleted.push(id)}}},insertReferralAccount:async data=>{if(insertError)throw Error('REFERRAL_INVALID');inserted.push(data);return 1},activateRegistration:async(...args)=>{activated.push(args);return activateResult},requireMail:()=>{mailCalls++;throw Error('SMTP blocked')},sendAccountMail:()=>{mailCalls++;throw Error('SMTP blocked')}};
 return {register:vm.runInNewContext(code+'\nregisterAccount',scope),created,deleted,inserted,activated,mailCalls:()=>mailCalls};
}
test('new registration completes despite unavailable SMTP and retains referral/profile/password',async()=>{
 const h=registration();const result=await h.register('signup@example.test',password,'Test','Customer',{country:'Österreich'},'REF123');
 assert.equal(result.ready,true);assert.equal(result.created,true);assert.equal(h.mailCalls(),0);assert.equal(h.created[0].email_confirm,false);
 assert.equal(h.inserted[0].referral,'REF123');assert.equal(h.inserted[0].details.country,'Österreich');assert.ok(await bcrypt.compare(password,h.inserted[0].passwordHash));assert.equal(h.activated.length,1);
});
test('retry of a stranded account verifies the saved password without changing existing profile or referrer',async()=>{
 for(const accepted of [true,false]){
  const h=registration({existing:{id:'customer',emailVerified:false,blocked:false,role:'USER'},activateResult:accepted});
  const result=await h.register('signup@example.test',password,'Replacement','Name',{},'OTHER');assert.equal(result.ready,accepted);assert.equal(result.created,false);assert.equal(h.inserted.length,0);assert.equal(h.created.length,0);assert.equal(h.activated[0][1],password);assert.equal(h.mailCalls(),0);
 }
});
test('existing verified/blocked/staff registrations never activate or replace an account',async()=>{
 for(const existing of [{emailVerified:true,role:'USER'},{blocked:true,role:'USER'},{role:'ADMIN'},{role:'STAFF'}]){
  const h=registration({existing});const result=await h.register('signup@example.test',password,'Test','Customer',{},'REF');assert.equal(result.ready,false);assert.equal(h.activated.length,0);assert.equal(h.created.length,0);assert.equal(h.mailCalls(),0);
 }
});
test('invalid referral cleans up only newly created auth identity and cannot activate; failures remain errors',async()=>{
 const h=registration({insertError:true});await assert.rejects(h.register('signup@example.test',password,'Test','Customer',{},'BAD'),/REFERRAL_INVALID/);assert.deepEqual(h.deleted,['identity']);assert.equal(h.activated.length,0);
 const failed=registration({activateResult:false});await assert.rejects(failed.register('signup@example.test',password,'Test','Customer',{},'REF'),/ACTIVATION_FAILED/);
 const duplicate=registration({providerError:{code:'email_exists'}});assert.equal((await duplicate.register('signup@example.test',password,'Test','Customer',{},'REF')).ready,false);assert.equal(duplicate.activated.length,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {referralInput,referralCookie} from '../lib/auth/referral-policy.mjs';
function load(file,name,context){const source=readFileSync(new URL(file,import.meta.url),'utf8').replace(/^import .*$/gm,'').replaceAll('export async function','async function');return vm.runInNewContext(source+'\n'+name,context)}
test('referral accepts own links and codes, rejects missing and foreign links',()=>{
 assert.equal(referralInput(' ABC123 '),'ABC123');assert.equal(referralInput('https://www.elysera.org/auth/register?ref=ABC123'),'ABC123');
 for(const value of ['',null,'https://evil.test/?ref=ABC123','https://www.elysera.org/','https://www.elysera.org/?ref=%20'])assert.equal(referralInput(value),null);
});
test('registration refuses missing/invalid referrals before insert; cookie attribution and profile are atomic',async()=>{
 let cookie,valid=false,inserts=0,stored=0;
 const tx={$executeRaw:async(strings,...values)=>{if(strings.join('').includes('INSERT')){inserts++;assert.ok(values.includes('parent'));return 1}return 1},$queryRaw:async()=>valid?[{id:'parent',level:2}]:[]};
 const insert=load('../lib/auth/referral-account.js','insertReferralAccount',{cookies:async()=>({get:()=>cookie?{value:cookie}:undefined}),referralInput,referralCookie,randomUUID:()=> 'generated',prisma:{$transaction:fn=>fn(tx)},storeDetails:async()=>stored++});
 const account={id:'new',email:'new@example.com',details:{name:'Test'}};
 await assert.rejects(insert(account),/REFERRAL_REQUIRED/);await assert.rejects(insert({...account,referral:'BAD'}),/REFERRAL_INVALID/);assert.equal(inserts,0);
 cookie='ABC123';valid=true;assert.equal(await insert(account),1);assert.equal(stored,1);assert.equal(inserts,2);
});
test('new Google identities stay pending; existing and blocked accounts are not reparented',async()=>{
 let rows=[];
 const ensure=load('../lib/auth/google-account.js','ensureGoogleAccount',{googleIdentity:u=>Boolean(u?.id),prisma:{$queryRaw:async()=>rows}});
 const identity={id:'google-id',email:'user@example.com'};
 assert.equal(await ensure(identity),'pending');rows=[{email:identity.email,supabaseUserId:identity.id,role:'USER',blocked:false}];assert.equal(await ensure(identity),true);rows[0].blocked=true;assert.equal(await ensure(identity),false);
});

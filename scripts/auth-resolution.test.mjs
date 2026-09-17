import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {eligibleAccount} from '../lib/auth/policy.mjs'
import {eligibleAdmin} from '../lib/admin/policy.mjs'
const source=readFileSync(new URL('../lib/auth/server.js',import.meta.url),'utf8').replace(/^import .*$/mg,'').replaceAll('export ','')
function harness({user={},identity={},assurance={},duplicate=false,providerError=false}={}){
 const counts={identity:0,mfa:0,read:0,write:0}
 const authIdentity={id:'identity',email:'member@example.test',email_confirmed_at:'2026-09-01',...identity}
 const row={id:'member',email:authIdentity.email,supabaseUserId:'identity',emailVerified:true,blocked:false,role:'AFFILIATE',adminAccess:false,firstLoginAt:'2026-09-01',...user}
 const client={auth:{getUser:async()=>{counts.identity++;return {data:{user:authIdentity},error:providerError?Error('unavailable'):null}},mfa:{getAuthenticatorAssuranceLevel:async()=>{counts.mfa++;return {data:{currentLevel:'aal1',nextLevel:'aal1',...assurance}}}}}}
 const db={$queryRaw:async()=>{counts.read++;return duplicate?[row,row]:[row]}}
 const api=Function('prisma','recordFirstLogin','eligibleAccount','eligibleAdmin',source+';return {loginPrincipalFor,principalFor,adminPrincipalFor}')(db,async()=>counts.write++,eligibleAccount,eligibleAdmin)
 return {api,client,counts}
}
test('login resolves member and approved admin with one identity check and one joined lookup',async()=>{
 for(const user of [{},{role:'ADMIN'},{adminAccess:true}]){const h=harness({user});const result=await h.api.loginPrincipalFor(h.client);assert.equal(result.role,user.role==='ADMIN'||user.adminAccess?'ADMIN':'AFFILIATE');assert.deepEqual(h.counts,{identity:1,mfa:1,read:1,write:0});assert.equal('adminAccess' in result,false);assert.equal('firstLoginAt' in result,false)}
})
test('combined login fails closed for blocked, unverified, mismatched, duplicate and MFA accounts',async()=>{
 for(const options of [{user:{blocked:true}},{user:{emailVerified:false}},{user:{email:'other@example.test'}},{user:{supabaseUserId:'other'}},{user:{role:'STAFF'}},{identity:{email_confirmed_at:null}},{assurance:{currentLevel:'aal1',nextLevel:'aal2'}},{duplicate:true},{providerError:true}]){const h=harness(options);assert.equal(await h.api.loginPrincipalFor(h.client),null);assert.equal(h.counts.write,0)}
})
test('customer-only and admin-only callers retain their separate authorization rules',async()=>{
 const member=harness();assert.equal(await member.api.adminPrincipalFor(member.client),null)
 const admin=harness({user:{role:'ADMIN'}});assert.equal(await admin.api.principalFor(admin.client),null)
 const first=harness({user:{firstLoginAt:null}});assert.ok(await first.api.loginPrincipalFor(first.client));assert.equal(first.counts.write,1)
})

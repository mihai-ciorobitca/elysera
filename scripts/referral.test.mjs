import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import {referralCode,referralLink} from '../lib/auth/referral-policy.mjs'
assert.equal(referralLink('https://www.elysera.org','ABC123'),'https://www.elysera.org/auth/register?ref=ABC123')
assert.equal(referralCode('../bad?ref=123'),null)
let code='ABC123',parent={id:'parent-id',level:3},queries=[],writes=[]
const tx={$queryRaw:async(s,...v)=>{queries.push([s.join('?'),v]);return parent?[parent]:[]},$executeRaw:async(s,...v)=>{writes.push([s.join('?'),v]);return 1}}
globalThis.refFixture={cookies:async()=>({get:()=>({value:code})}),randomUUID,prisma:{$transaction:async fn=>fn(tx)},referralCookie:'elysera-referral',referralCode}
let source=readFileSync('lib/auth/referral-account.js','utf8').replace(/^import .*\r?\n/gm,'');source='const {cookies,randomUUID,prisma,referralCookie,referralCode}=globalThis.refFixture;\n'+source
const {insertReferralAccount}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
const input={id:'new',email:'new@example.test',name:'New',last:'Partner',identityId:randomUUID(),verified:true}
await insertReferralAccount(input);assert.ok(writes[0][0].includes('pg_advisory_xact_lock'));assert.equal(writes[1][1][7],'parent-id');assert.equal(writes[1][1][8],4);assert.match(writes[1][1][9],/^[A-F0-9]{12}$/);assert.ok(writes[1][0].includes('ON CONFLICT ("email") DO NOTHING'));assert.ok(queries[0][0].includes('lower("email")<>'));assert.ok(queries[0][0].includes('"blocked"=false'))
parent=null;writes=[];await assert.rejects(()=>insertReferralAccount(input),/REFERRAL_INVALID/);assert.equal(writes.length,1)
code='';writes=[];await insertReferralAccount({...input,verified:false});assert.equal(writes[1][1][7],null);assert.equal(writes[1][1][8],0);assert.equal(writes[1][1][6],false)
console.log('Referral policy, atomic new-account assignment, invalid inviter rejection, duplicate preservation, level and code generation passed')

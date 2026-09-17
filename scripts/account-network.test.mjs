import {networkSummary} from '../lib/network-summary.mjs'
import {canViewFullNetwork} from '../lib/auth/network-access.mjs'
import {Prisma} from '@prisma/client'
import {OWN_IDS,PAID} from '../lib/admin/reports-model.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../app/api/account/network/route.js',import.meta.url),'utf8')
function harness(user,rows=[],fail=false){
 const queries=[]
 const GET=Function('NextResponse','currentUser','prisma','canViewFullNetwork','Prisma','OWN_IDS','PAID','networkSummary',source.replace(/^import .*$/gm,'').replace(/export /g,'')+';return GET')(
  {json:(body,options)=>({body,...options})},async()=>user,
  {$queryRaw:async(strings,...values)=>{queries.push({sql:strings.join('?'),values});if(fail)throw Error('offline');return rows}},canViewFullNetwork,Prisma,OWN_IDS,PAID,networkSummary)
 return {GET,queries}
}
test('network returns only direct Elysera recommendations for every member',async()=>{
 const h=harness({id:'root'},[{id:'child',parentId:'root',depth:1,total:1n}])
 const r=await h.GET()
 assert.equal(r.status,200)
 assert.equal(r.body.partners[0].depth,1)
 assert.equal(r.body.total,1)
 assert.equal(r.body.truncated,false)
 assert.equal('total' in r.body.partners[0],false)
 const q=h.queries[1]
 assert.ok(q.values.every(v=>v==='root'))
 assert.match(q.sql,/ElyseraPartnerProfile/)
 assert.match(q.sql,/WHERE r\."parentUserId"=\? AND u\."id"<>\?/);
 assert.match(q.sql,/1 AS depth/);
 assert.doesNotMatch(q.sql,/RECURSIVE|UNION|JOIN network/)
 assert.doesNotMatch(q.sql,/referredById|LIMIT|depth\s*<|Order|Commission|credits|turnover|membership/)
})
test('network requires login and reports database failure instead of an empty tree',async()=>{
 const anonymous=harness(null)
 assert.equal((await anonymous.GET()).status,401)
 assert.equal(anonymous.queries.length,0)
 assert.equal((await harness({id:'root'},[],true).GET()).status,503)
})

test('only the two fixed founder identities get structure to level ten',async()=>{
 for(const id of ['1f0ff6f6-47f6-433f-9ac3-137473003af2','4b829d44-616b-4dff-b5d6-eded9035874d']){
 const h=harness({id});const r=await h.GET();assert.equal(r.status,200);assert.equal(h.queries.length,2);assert.match(h.queries[1].sql,/WITH RECURSIVE/);assert.match(h.queries[1].sql,/ANY\(n.path\)/);assert.ok(h.queries[1].values.every(v=>v===id));assert.equal(r.body.teamRevenue,0);assert.match(h.queries[1].sql,/n.depth<10/);assert.match(h.queries[0].sql,/NOT EXISTS/);assert.match(h.queries[0].sql,/IS NULL/)
 }
})
test('names, roles, query flags and impersonation do not grant founder access',async()=>{
 for(const user of [{id:'other',firstName:'Jessica',secondName:'Winterholler',role:'ADMIN',fullNetworkAccess:true},{id:'1f0ff6f6-47f6-433f-9ac3-137473003af2',impersonatedBy:'admin'},{id:'4b829d44-616b-4dff-b5d6-eded9035874d',blocked:true}]){
 assert.equal(canViewFullNetwork(user),false);const h=harness(user);const r=await h.GET();assert.equal(h.queries.length,2);assert.equal('totalRevenue' in r.body,false);assert.doesNotMatch(h.queries[1].sql,/RECURSIVE|Order/)
 }
 assert.equal(canViewFullNetwork(null),false)
})

test('members receive aggregate team revenue without revealing their sponsor',async()=>{const h=harness({id:'root'});const r=await h.GET();assert.equal(r.body.teamRevenue,0);assert.equal('sponsor' in r.body,false);const q=h.queries[0];assert.match(q.sql,/o\."userId" IN \(SELECT id FROM team\)/);assert.doesNotMatch(q.sql,/SELECT \*|email|phone|sponsor|firstName|secondName/);assert.doesNotMatch(q.sql,/depth<10/);assert.ok(q.values.includes('root'))})

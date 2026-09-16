import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../app/api/account/network/route.js',import.meta.url),'utf8')
function harness(user,rows=[],fail=false){
 const queries=[]
 const GET=Function('NextResponse','currentUser','prisma',source.replace(/^import .*$/gm,'').replace(/export /g,'')+';return GET')(
  {json:(body,options)=>({body,...options})},async()=>user,
  {$queryRaw:async(strings,...values)=>{queries.push({sql:strings.join('?'),values});if(fail)throw Error('offline');return rows}})
 return {GET,queries}
}
test('network uses the imported Elysera graph without financial data or depth and row cutoffs',async()=>{
 const h=harness({id:'root'},[{id:'child',parentId:'root',depth:101,total:1n}])
 const r=await h.GET()
 assert.equal(r.status,200)
 assert.equal(r.body.partners[0].depth,101)
 assert.equal(r.body.total,1)
 assert.equal(r.body.truncated,false)
 assert.equal('total' in r.body.partners[0],false)
 const q=h.queries[0]
 assert.ok(q.values.every(v=>v==='root'))
 assert.match(q.sql,/ElyseraPartnerProfile/)
 assert.match(q.sql,/NOT\(u\."id"=ANY\(n.path\)\)/)
 assert.doesNotMatch(q.sql,/referredById|LIMIT|depth\s*<|Order|Commission|credits|turnover|membership/)
})
test('network requires login and reports database failure instead of an empty tree',async()=>{
 const anonymous=harness(null)
 assert.equal((await anonymous.GET()).status,401)
 assert.equal(anonymous.queries.length,0)
 assert.equal((await harness({id:'root'},[],true).GET()).status,503)
})

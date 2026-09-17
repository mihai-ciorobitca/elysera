import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {partnerGraph,partnerIndex,partnerView,eligibleCommission,exclusivelyOwnOrder} from '../lib/admin/partners-policy.mjs'
const source=readFileSync(new URL('../app/api/admin/partners/route.js',import.meta.url),'utf8')
function harness({admin=true,accounts=[],relationships=[],ready=true,fail=false}={}){const queries=[],options=[];const tx={$queryRaw:async(strings,...values)=>{const sql=strings.join('?');queries.push({sql,values});if(fail)throw Error('database');if(sql.includes('to_regclass'))return [{ready}];if(sql.includes('SELECT r.'))return relationships;if(sql.includes('SELECT u.'))return accounts;return []}};const prisma={$transaction:async(fn,opt)=>{options.push(opt);return fn(tx)}};const routes=Function('NextResponse','Prisma','prisma','currentAdmin','ELYSERA_PRODUCTS','partnerGraph',source.replace(/^import .*\r?\n/gm,'').replace(/export /g,'')+'\nreturn {GET}')({json:(body,{status})=>({body,status})},{join:x=>x},prisma,async()=>admin?{id:'admin'}:null,[{id:'own'}],partnerGraph);return {get:id=>routes.GET({url:'https://elysera.de/api/admin/partners'+(id?'?id='+id:'')}),queries,options}}
test('anonymous access rejected before any database access',async()=>{const h=harness({admin:false});assert.equal((await h.get()).status,401);assert.equal(h.queries.length,0)})
test('unregistered shared account cannot access any detail evidence',async()=>{const h=harness({accounts:[{id:'own'}]});assert.equal((await h.get('foreign')).status,404);assert.equal(h.queries.length,1)})
test('own accounts remain visible before relationship migration',async()=>{const h=harness({accounts:[{id:'own'}],ready:false});const r=await h.get();assert.equal(r.body.partners[0].partnerStatus,'unconfigured');assert.equal(r.body.relationshipsReady,false);assert.equal(h.queries.length,2)})
test('cycle, self-cycle and foreign links are bounded and marked',()=>{const accounts=['a','b','c','d'].map(id=>({id}));const graph=partnerGraph(accounts,[{userId:'a',parentUserId:'b'},{userId:'b',parentUserId:'a'},{userId:'c',parentUserId:'c'},{userId:'d',parentUserId:'foreign'},{userId:'foreign',parentUserId:'a'}]);assert.equal(graph.length,4);assert.ok(graph.slice(0,3).every(x=>x.relationshipConflict&&x.ancestors.length===0));assert.equal(graph[3].parentId,null);assert.equal(graph[3].partnerStatus,'unconfigured');assert.ok(!JSON.stringify(graph).includes('foreign'))})
test('hierarchy uses own explicit relationships only',()=>{const rows=partnerGraph(['a','b','c'].map(id=>({id})),[{userId:'b',parentUserId:'a',status:'active'},{userId:'c',parentUserId:'b',status:'paused'}]);assert.deepEqual(rows[2].ancestors,['b','a']);assert.equal(rows[0].partnerStatus,'unconfigured')})
test('evidence rejects empty, foreign, mixed, missing products, foreign buyer and beneficiary',()=>{const own=['a','b'];for(const products of [[],[{productId:'foreign'}],[{productId:'own'},{productId:'foreign'}],[{productId:null}],[{}]]){assert.equal(exclusivelyOwnOrder(products,['own']),false);assert.equal(Boolean(eligibleCommission({userId:'a',order:{userId:'b',items:products}},own,['own'])),false)}for(const [userId,buyer] of [['foreign','b'],['a','foreign']])assert.equal(Boolean(eligibleCommission({userId,order:{userId:buyer,items:[{productId:'own'}]}},own,['own'])),false);assert.equal(eligibleCommission({userId:'a',order:{userId:'b',items:[{productId:'own'}]}},own,['own']),true)})
test('actual route SQL gates evidence with account and complete product isolation in one bounded snapshot',async()=>{const h=harness({accounts:[{id:'a'}]});assert.equal((await h.get('a')).status,200);const evidence=h.queries.filter(q=>q.sql.includes('FROM public."Order"')||q.sql.includes('FROM public."Commission"'));assert.equal(evidence.length,2);for(const q of evidence){assert.match(q.sql,/EXISTS/);assert.match(q.sql,/NOT EXISTS/);assert.match(q.sql,/IS NULL/);assert.match(q.sql,/NOT IN/);assert.match(q.sql,/LIMIT 101/)}assert.match(evidence[1].sql,/JOIN public\."ElyseraAccountProfile" buyer/);assert.deepEqual(h.options[0],{timeout:30000,maxWait:10000,isolationLevel:'RepeatableRead'});assert.doesNotMatch(h.queries.map(q=>q.sql).join(' '),/referredById|creditsBalance|"role"|UPDATE|INSERT|DELETE/);assert.doesNotMatch(source,/function (PATCH|POST|DELETE)/)})
test('database failures do not become zero metrics',async()=>{const h=harness({fail:true});const r=await h.get();assert.equal(r.status,503);assert.equal(r.body.partners,undefined)})

test('missing parents are visible conflicts without leaking a foreign identifier',()=>{
 const graph=partnerGraph([{id:'child'},{id:'grandchild'}],[{userId:'child',parentUserId:'foreign',status:'active'},{userId:'grandchild',parentUserId:'child',status:'active'}])
 assert.ok(graph.every(p=>p.relationshipConflict))
 assert.equal(graph[0].parentId,null)
 assert.doesNotMatch(JSON.stringify(graph),/foreign/)
 assert.equal(partnerView(graph,{view:'network',filter:'conflict'}).rows.length,2)
})
test('all accounts remain available beyond the old 5000 profile hard stop',async()=>{
 const accounts=Array.from({length:5002},(_,i)=>({id:'user-'+i}))
 const h=harness({accounts});const r=await h.get()
 assert.equal(r.status,200);assert.equal(r.body.partners.length,5002)
 assert.doesNotMatch(h.queries[0].sql,/LIMIT/)
})
test('branch navigation, global search and page changes retain full graph context',()=>{
 const accounts=Array.from({length:62},(_,i)=>({id:'id-'+i,firstName:'Member',secondName:String(i)}))
 const links=accounts.map((a,i)=>({userId:a.id,parentUserId:i===0?null:i===61?'id-60':'id-0',status:i===60?'paused':'active'}))
 const graph=partnerGraph(accounts,links),index=partnerIndex(graph)
 assert.equal(index.children.get(null).length,1)
 assert.equal(index.children.get('id-0').length,60)
 assert.equal(index.descendants.get('id-0'),61)
 assert.equal(partnerView(graph,{view:'network',focus:'id-0',page:3}).rows.length,10)
 assert.equal(partnerView(graph,{view:'network',focus:'id-60'}).rows[0].id,'id-61')
 assert.equal(partnerView(graph,{view:'network',focus:'id-60',search:' Member 1 '}).global,true)
 assert.equal(partnerView(graph,{view:'network',focus:'id-60',filter:'paused'}).rows[0].id,'id-60')
 assert.equal(partnerView(graph,{search:'id-61',page:99}).current,1)
 assert.equal(partnerView(graph,{search:'id-61',page:99}).rows[0].ancestors[0],'id-60')
 assert.equal(partnerView(graph,{view:'network',focus:'id-61'}).rows.length,0)
})

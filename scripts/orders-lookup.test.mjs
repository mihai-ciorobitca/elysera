import test from 'node:test'
import assert from 'node:assert/strict'
import {Prisma} from '@prisma/client'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
import {parseOrderLookup} from '../lib/admin/orders-lookup-policy.mjs'
import {lookupOrders} from '../lib/admin/orders-lookup-service.mjs'
const parse=value=>parseOrderLookup(new URLSearchParams(value))
test('lookup validates real calendar dates, bounds and meaningful filters',()=>{
 for(const value of ['','q=x','q=xx&page=-1','q=xx&page=1.5','q=xx&from=2026-02-30','q=xx&from=2026-10-01&to=2026-09-30','q=xx&status=OTHER'])assert.throws(()=>parse(value))
 const input=parse('q=%23ABC12345&from=2026-09-01&to=2026-09-13');assert.equal(input.q,'abc12345');assert.equal(input.from.toISOString(),'2026-09-01T00:00:00.000Z');assert.equal(input.to.toISOString(),'2026-09-14T00:00:00.000Z')
 assert.equal(parse('status=ISSUE').q,'')
})
function database(total,rows){const calls=[];let options;return {calls,get options(){return options},async $transaction(fn,opts){options=opts;return fn({$queryRaw:async query=>{calls.push(query);return calls.length===1?[{total:BigInt(total)}]:rows}})}}}
test('full-history lookup keeps literal user input parameterized and own scope in both queries',async()=>{
 const db=database(1001,[{id:'older-than-500'}]);const result=await lookupOrders(db,Prisma,['own-a','own-b'],parse("q=';DROP TABLE x;--&page=26"))
 assert.equal(result.orders[0].id,'older-than-500');assert.equal(result.total,1001);assert.equal(result.page,26);assert.equal(result.pages,51)
 for(const sql of db.calls){assert.match(sql.sql,/NOT EXISTS.*other/s);assert.match(sql.sql,/other\."productId" IS NULL/);assert.match(sql.sql,/EXISTS.*own/s);assert.doesNotMatch(sql.sql,/DROP TABLE/);assert(sql.values.includes("';drop table x;--"));assert(sql.values.includes('own-a'));assert(sql.values.includes('own-b'))}
 assert(db.calls[1].values.includes(500));assert.equal(db.options.isolationLevel,'RepeatableRead');assert.equal(db.options.timeout,30000)
})
test('count and page agree under one snapshot, stale page clamps to actual last page',async()=>{
 const db=database(21,[{id:'last'}]);const result=await lookupOrders(db,Prisma,['own-a'],parse('status=PAID&page=50'))
 assert.equal(result.page,2);assert.equal(result.pages,2);assert(db.calls[1].values.includes(20));assert.match(db.calls[1].sql,/ORDER BY o\."createdAt" DESC,o\."id"/)
})
test('empty results have stable pagination and projected address field casing is preserved',async()=>{
 const db=database(0,[]),result=await lookupOrders(db,Prisma,['own-a'],parse('q=nothing'))
 assert.deepEqual(result,{orders:[],total:0,page:1,pages:1,pageSize:20})
 for(const field of ['shippingName','shippingAddress1','shippingState','shippingCity','shippingPostalCode','shippingCountry','trackingFee'])assert(db.calls[1].sql.includes('AS "'+field+'"'))
})
test('actual route rejects unauthenticated and invalid requests before any lookup; hides database errors',async()=>{
 const source=(await readFile(new URL('../app/api/admin/orders/lookup/route.js',import.meta.url),'utf8')).replace(/^import .*$/mg,'').replaceAll('export ','')
 for(const [admin,query,status,fail] of [[false,'q=Lena',401,false],[true,'q=x',400,false],[true,'q=Lena',503,true]]){
  let calls=0;const context={URL,NextResponse:{json:(body,options)=>({body,...options})},currentAdmin:async()=>admin,Prisma,prisma:{},ELYSERA_PRODUCTS:[{id:'own-a'}],parseOrderLookup,lookupOrders:async()=>{calls++;if(fail)throw Error('secret database failure');return {orders:[]}}};vm.createContext(context);vm.runInContext(source+';globalThis.handler=GET',context);const response=await context.handler({url:'https://elysera.test/api/admin/orders/lookup?'+query});assert.equal(response.status,status);assert.equal(calls,fail?1:0);assert.doesNotMatch(JSON.stringify(response),/secret/);assert.match(response.headers['Cache-Control'],/no-store/)
 }
})

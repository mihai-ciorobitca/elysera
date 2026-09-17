import {networkSummary} from '../lib/network-summary.mjs'
import {accountCommissions,commissionQualification} from '../lib/account-commissions.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
import {Prisma} from '@prisma/client'
const source=(await readFile(new URL('../app/api/account/dashboard/route.js',import.meta.url),'utf8')).replace(/^import .*$/mg,'').replaceAll('export ','')
test('customer orders and commissions exclude unknown product lines and bind account identity',async()=>{
 const queries=[];const context={networkSummary,accountCommissions,commissionQualification,Prisma,ELYSERA_PRODUCTS:[{id:'own-product'}],currentUser:async()=>({id:'own-account'}),NextResponse:{json:(body,options)=>({body,...options})},prisma:{$queryRaw:async(strings,...values)=>{queries.push(Prisma.sql(strings,...values));return []}}}
 vm.createContext(context);vm.runInContext(source+';globalThis.handler=GET',context);const result=await context.handler();assert.equal(queries.length,4);assert.equal(result.body.orders.length,0);assert.equal(result.body.qualification.qualified,false);assert.match(queries[1].sql,/elysera_commission_eligible/);assert.match(queries[1].sql,/elysera_only_order/);assert.ok(queries[1].values.includes('own-account'))
 for(const query of [queries[0]]){assert.match(query.sql,/other\."productId" IS NULL OR other\."productId" NOT IN/);assert(query.values.includes('own-account'));assert(query.values.includes('own-product'));assert.doesNotMatch(query.sql,/(?:FROM|JOIN) "(?:Order|OrderItem|Commission)"/)}
})
test('customer dashboard refuses unauthenticated reads without querying data',async()=>{
 const context={currentUser:async()=>null,NextResponse:{json:(body,options)=>({body,...options})},prisma:{$queryRaw:()=>{throw Error('must not query')}}};vm.createContext(context);vm.runInContext(source+';globalThis.handler=GET',context);assert.equal((await context.handler()).status,401)
})

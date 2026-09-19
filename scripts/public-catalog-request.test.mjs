import test from 'node:test'
import assert from 'node:assert/strict'
import {createPublicCatalogLoader} from '../lib/public-catalog-request.mjs'
test('public catalog navigation shares pending work and expires after 30 seconds',async()=>{
 let calls=0,time=0,release
 const load=createPublicCatalogLoader({now:()=>time,fetcher:async()=>{calls++;await new Promise(r=>{release=r});return {ok:true,json:async()=>({products:[calls]})}}})
 const first=load('/api/product-content'),second=load('/api/product-content');assert.equal(calls,1);release();assert.deepEqual(await first,await second)
 await load('/api/product-content');assert.equal(calls,1)
 time=30001;const expired=load('/api/product-content');assert.equal(calls,2);release();await expired
})
test('failure remains retryable and account or live-price endpoints cannot enter the cache',async()=>{
 let calls=0
 const load=createPublicCatalogLoader({fetcher:async()=>{calls++;return {ok:calls>1,json:async()=>({products:[]})}}})
 await assert.rejects(load('/api/product-content'));await load('/api/product-content');assert.equal(calls,2)
 for(const url of ['/api/account/dashboard','/api/products','/api/auth/signin'])await assert.rejects(load(url),/Not a public/)
 assert.equal(calls,2)
})

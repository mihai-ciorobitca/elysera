import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {maintenanceDecision} from '../lib/admin/settings-policy.mjs'

const source=await readFile(new URL('../proxy.js',import.meta.url),'utf8')
const body=source.slice(source.indexOf('export async function proxy(request){')+'export async function proxy(request){'.length,source.indexOf('\nexport const config')).replace(/}\s*$/,'')
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor
function harness(settings,fail=false){
 let reads=0
 const result=()=>({headers:new Headers(),cookies:{values:[],set(...args){this.values.push(args)}}})
 const NextResponse={next:()=>({...result(),status:200}),rewrite:(url,init)=>({...result(),...init,headers:new Headers(init.headers),destination:url})}
 const invoke=new AsyncFunction('request','NextResponse','prisma','getSiteSettings','maintenanceDecision','authConfig','referralCode','referralCookie',body)
 return {get reads(){return reads},run:pathname=>{const url=new URL(pathname,'https://elysera.test');url.clone=()=>new URL(url);return invoke({nextUrl:url,method:'GET',headers:new Headers(),cookies:{has:()=>false,getAll:()=>[]}},NextResponse,{},async()=>{reads++;if(fail)throw Error('unavailable');return settings},maintenanceDecision,()=>({}),value=>value==='partner123'?value:null,'ref')}}
}
test('active maintenance rewrites public pages to 503 without query leakage',async()=>{
 const h=harness({maintenance:true}),r=await h.run('/shop?ref=partner123')
 assert.equal(r.status,503);assert.equal(r.destination.pathname,'/maintenance');assert.equal(r.destination.search,'');assert.equal(r.headers.get('Retry-After'),'300');assert.equal(r.headers.get('Cache-Control'),'private, no-store')
})
test('maintenance never queries settings for admin auth APIs assets or its own page',async()=>{
 const h=harness({maintenance:true})
 for(const path of ['/admin/settings','/auth/admin','/api/admin/settings','/admin-preview/settings-check','/media/a.webp','/maintenance'])assert.equal((await h.run(path)).status,200)
 assert.equal(h.reads,0)
})
test('disabled maintenance and database failure preserve normal response and referral handling',async()=>{
 for(const fail of [false,true]){const h=harness({maintenance:false},fail),r=await h.run('/shop?ref=partner123');assert.equal(r.status,200);assert.equal(r.cookies.values[0][1],'partner123');assert.equal(h.reads,1)}
})

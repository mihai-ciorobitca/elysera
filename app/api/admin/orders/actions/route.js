import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {orderActionRead,orderActionMutate} from '@/lib/admin/order-actions-service.mjs'
export const dynamic='force-dynamic'
export const maxDuration=30
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
async function handle(request,write){
 if(write&&!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const actor=await currentAdmin();if(!actor)return reply({error:'Administrator-Anmeldung erforderlich.',code:'AUTH_REQUIRED'},401)
 const ids=ELYSERA_PRODUCTS.map(p=>p.id)
 if(!write){const id=new URL(request.url).searchParams.get('id');if(!id||id.length>100)return reply({error:'Bestellung erforderlich.'},400);return reply({actorId:actor.id,state:await prisma.$transaction(tx=>orderActionRead(tx,ids,id,true),{timeout:30000,maxWait:10000})})}
 const text=await request.text();if(text.length>12000)return reply({error:'Eingabe zu lang.'},400)
 let input;try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 return reply(await orderActionMutate(prisma,actor,ids,input))
 }catch(e){return reply({error:e.status?e.message:'Ergebnis nicht bestätigt. Dieselbe Anfrage erneut versuchen.',code:e.status?e.code:'UNCONFIRMED'},e.status||503)}
}
export const GET=request=>handle(request,false)
export const POST=request=>handle(request,true)

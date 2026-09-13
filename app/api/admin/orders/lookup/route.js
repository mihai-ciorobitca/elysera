import {NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {parseOrderLookup} from '@/lib/admin/orders-lookup-policy.mjs'
import {lookupOrders} from '@/lib/admin/orders-lookup-service.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(request){
 try{if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
  const input=parseOrderLookup(new URL(request.url).searchParams)
  return reply(await lookupOrders(prisma,Prisma,ELYSERA_PRODUCTS.map(p=>p.id),input))
 }catch(e){return reply({error:e.status===400?e.message:'Suche momentan nicht verfügbar. Bitte erneut versuchen.'},e.status===400?400:503)}
}

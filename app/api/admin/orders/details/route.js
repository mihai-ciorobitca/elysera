import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {orderDetailsRead,orderDetailsMutate} from '@/lib/admin/order-details-service.mjs'
import {orderDetailsHttp} from '@/lib/admin/order-details-http.mjs'
export const dynamic='force-dynamic'
export const maxDuration=30
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const handle=(request,write)=>orderDetailsHttp(request,write,{db:prisma,currentAdmin,sameOrigin,ids:ELYSERA_PRODUCTS.map(p=>p.id),reply,read:orderDetailsRead,mutate:orderDetailsMutate})
export const GET=request=>handle(request,false)
export const POST=request=>handle(request,true)

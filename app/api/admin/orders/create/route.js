import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {orderCreateHttp} from '@/lib/admin/order-create-http.mjs'
import {orderCreateChoices,orderCreateMutate} from '@/lib/admin/order-create-service.mjs'
const deps={db:prisma,actor:currentAdmin,sameOrigin,ids:ELYSERA_PRODUCTS.map(p=>p.id),choices:orderCreateChoices,mutate:orderCreateMutate,reply:(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})}
export const dynamic='force-dynamic'
export const runtime='nodejs'
export const maxDuration=30
export const GET=request=>orderCreateHttp(request,false,deps)
export const POST=request=>orderCreateHttp(request,true,deps)

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {readProductContent,mutateProductContent} from '@/lib/admin/product-content-service.mjs'
import {productContentHttp} from '@/lib/admin/product-content-http.mjs'
export const dynamic='force-dynamic'
export const maxDuration=30
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const handle=(request,write)=>productContentHttp(request,write,{db:prisma,currentAdmin,sameOrigin,reply,read:readProductContent,mutate:mutateProductContent})
export const GET=request=>handle(request,false)
export const PATCH=request=>handle(request,true)

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {readMerchandising,mutateMerchandising} from '@/lib/admin/product-merchandising-service.mjs'
import {merchandisingHttp} from '@/lib/admin/product-merchandising-http.mjs'
export const dynamic='force-dynamic'
export const maxDuration=30
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const handle=(r,w)=>merchandisingHttp(r,w,{db:prisma,currentAdmin,sameOrigin,reply,read:readMerchandising,mutate:mutateMerchandising})
export const GET=r=>handle(r,false)
export const PUT=r=>handle(r,true)

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {productCatalog,productSave} from '@/lib/admin/product-recovery.mjs'
import {productHttp} from '@/lib/admin/product-http-core.mjs'
export const dynamic='force-dynamic'
async function handle(request,params,write){const {id}=await params;return productHttp(request,id,write,{db:prisma,currentAdmin,sameOrigin,ids:ELYSERA_PRODUCTS.map(p=>p.id),catalog:productCatalog,save:productSave,reply:(body,status=200)=>{const image=p=>({...p,image:ELYSERA_PRODUCTS.find(x=>x.id===p.id)?.image});return NextResponse.json({...body,...(body.products?{products:body.products.map(image)}:{}),...(body.product?{product:image(body.product)}:{})},{status,headers:{'Cache-Control':'private, no-store'}})}})}
export const GET=(request,{params})=>handle(request,params,false)
export const PATCH=(request,{params})=>handle(request,params,true)

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {readMerchandising} from '@/lib/admin/product-merchandising-service.mjs'
export const dynamic='force-dynamic'
export async function GET(){try{const {products}=await readMerchandising(prisma);return NextResponse.json({products},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Produktdarstellung konnte nicht geladen werden.'},{status:503,headers:{'Cache-Control':'no-store'}})}}

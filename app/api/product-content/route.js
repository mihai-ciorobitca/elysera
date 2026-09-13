import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {loadPublicProductContent} from '@/lib/product-content.mjs'
export const dynamic='force-dynamic'
export async function GET(){try{return NextResponse.json({products:await loadPublicProductContent(prisma)},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Produkttexte konnten nicht geladen werden.'},{status:503,headers:{'Cache-Control':'no-store'}})}}

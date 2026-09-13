import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
export const dynamic='force-dynamic'
export async function GET(){
 const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
 try{if(!await currentAdmin())return reply({error:'Administrator-Anmeldung erforderlich.'},401)
 const entries=await prisma.$queryRaw`SELECT * FROM public."ElyseraFaqEntry" ORDER BY "sortOrder","createdAt","id" LIMIT 2001`
 return reply({entries:entries.slice(0,2000),limited:entries.length>2000})
 }catch{return reply({error:'FAQ konnten nicht geladen werden. Bitte erneut versuchen.'},503)}
}

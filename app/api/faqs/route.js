import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
export const dynamic='force-dynamic'
export async function GET(request){
 const locale=new URL(request.url).searchParams.get('locale')||'de'
 if(locale.length>12||!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(locale))return NextResponse.json({error:'Ungültige Sprache.'},{status:400})
 try{const entries=await prisma.$queryRaw`SELECT "question","answer" FROM public."ElyseraFaqEntry" WHERE "status"='APPROVED' AND "locale"=${locale} ORDER BY "sortOrder","createdAt","id"`
 return NextResponse.json({entries},{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'FAQ momentan nicht verfügbar.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}

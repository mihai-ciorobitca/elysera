import {cookies} from 'next/headers'
import {prisma} from '@/lib/prisma'
import {impersonationCookie,tokenHash} from '@/lib/auth/impersonation.mjs'
import {NextResponse} from 'next/server'
import {authClient} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
export async function POST(request){
 if(!sameOrigin(request))return NextResponse.json({error:'Nicht zulässig.'},{status:403})
 try{const jar=await cookies(),token=jar.get(impersonationCookie)?.value;if(token){await prisma.$executeRaw`UPDATE public."ElyseraImpersonationSession" SET "endedAt"=NOW() WHERE "tokenHash"=${tokenHash(token)} AND "endedAt" IS NULL`;jar.set(impersonationCookie,'',{path:'/',maxAge:0,httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production'});return NextResponse.json({ok:true,redirect:'/admin/users'},{headers:{'Cache-Control':'no-store'}})}const client=await authClient();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Abmelden vorübergehend nicht möglich.'},{status:503})}
}

import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin,currentUser} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {supportRead,supportMutate} from './support-service.mjs'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function supportHttp(request,admin,write=false){return supportHttpCore(request,admin,write,{prisma,currentAdmin,currentUser,sameOrigin,reply,supportRead,supportMutate})}
import {supportHttpCore} from './support-http-core.mjs'

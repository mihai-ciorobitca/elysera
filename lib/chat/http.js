import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin,currentUser} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {resolveChatActor,chatCookie} from './identity.mjs'
import {readChat,mutateChat} from './service.mjs'
import {chatHttpCore} from './http-core.mjs'
export const chatHttp=(request,admin,write=false)=>chatHttpCore(request,admin,write,{db:prisma,resolve:()=>resolveChatActor(prisma,request,currentAdmin,currentUser,admin),sameOrigin,read:readChat,mutate:mutateChat,reply:(body,status=200,actor)=>{const r=NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});if(actor?.cookie)r.cookies.set(chatCookie,actor.cookie,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:31536000});return r}})

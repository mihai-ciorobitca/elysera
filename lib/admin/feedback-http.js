import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin,currentUser} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {feedbackHttpCore} from './feedback-http-core.mjs'
import {feedbackRead,feedbackMutate} from './feedback-service.mjs'
export const feedbackHttp=(request,admin,write=false)=>feedbackHttpCore(request,admin,write,{db:prisma,currentAdmin,currentUser,sameOrigin,reply:(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}}),read:feedbackRead,mutate:feedbackMutate})

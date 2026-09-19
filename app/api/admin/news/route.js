import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {newsHttp} from '@/lib/news-http.mjs'
import {listNews,saveNews} from '@/lib/news-service.mjs'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const handle=(r,write)=>newsHttp(r,write,{db:prisma,currentAdmin,sameOrigin,list:listNews,save:saveNews,reply})
export const GET=r=>handle(r,false)
export const PATCH=r=>handle(r,true)

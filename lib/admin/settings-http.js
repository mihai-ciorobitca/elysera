import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {getSiteSettings,saveSiteSettings} from './settings-service.mjs'
import {settingsHttpCore} from './settings-http-core.mjs'
export const settingsHttp=(request,admin,write=false)=>settingsHttpCore(request,admin,write,{db:prisma,currentAdmin,sameOrigin,reply:(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}}),read:getSiteSettings,save:saveSiteSettings})

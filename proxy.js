import {referralCookie,referralCode} from './lib/auth/referral-policy.mjs'
import {createServerClient} from '@supabase/ssr'
import {NextResponse} from 'next/server'
import {prisma} from './lib/prisma'
import {getSiteSettings} from './lib/admin/settings-service.mjs'
import {maintenanceDecision} from './lib/admin/settings-policy.mjs'
import {authConfig,cookieOptions,storageCookieOptions} from './lib/auth/policy.mjs'
export async function proxy(request){
 const requestHeaders=new Headers(request.headers);requestHeaders.set('x-elysera-method',request.method);requestHeaders.set('x-elysera-path',request.nextUrl.pathname);
 if(request.cookies.has('elysera-impersonation')&&(request.nextUrl.pathname.startsWith('/api/auth/')||request.nextUrl.pathname.startsWith('/api/admin-auth/')||request.nextUrl.pathname==='/auth/google/callback')&&!request.nextUrl.pathname.endsWith('/signout'))return NextResponse.json({error:'Bitte zuerst zum Admin zurückkehren, um die Anmeldung zu verwalten.'},{status:403});

 if(maintenanceDecision(request.nextUrl.pathname,{maintenance:true})){
  try{
   const settings=await getSiteSettings(prisma)
   if(maintenanceDecision(request.nextUrl.pathname,settings)){
    const destination=request.nextUrl.clone();destination.pathname='/maintenance';destination.search=''
    return NextResponse.rewrite(destination,{status:503,headers:{'Cache-Control':'private, no-store','Retry-After':'300'}})
   }
  }catch{/* Keep the storefront reachable if the settings database is unavailable. */}
 }
 let response=NextResponse.next({request:{headers:requestHeaders}});const {url,key}=authConfig()
 if(url&&key&&request.cookies.getAll().some(c=>c.name.startsWith('elysera-auth'))){
  const client=createServerClient(url,key,{cookieOptions:cookieOptions(),cookies:{getAll:()=>request.cookies.getAll(),setAll:items=>{for(const {name,value}of items)request.cookies.set(name,value);requestHeaders.set('cookie',request.cookies.toString());response=NextResponse.next({request:{headers:requestHeaders}});for(const {name,value,options}of items)response.cookies.set(name,value,storageCookieOptions(options))}}})
  await client.auth.getUser()
 }
 const code=referralCode(request.nextUrl.searchParams.get('ref'));if(code)response.cookies.set(referralCookie,code,{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:60*60*24*30});
 response.headers.set('Cache-Control','private, no-store');return response
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|media/).*)']}

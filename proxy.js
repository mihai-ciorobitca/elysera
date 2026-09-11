import {createServerClient} from '@supabase/ssr'
import {NextResponse} from 'next/server'
import {authConfig,cookieOptions,storageCookieOptions} from './lib/auth/policy.mjs'
export async function proxy(request){
 let response=NextResponse.next({request});const {url,key}=authConfig()
 if(url&&key&&request.cookies.getAll().some(c=>c.name.startsWith('elysera-auth'))){
  const client=createServerClient(url,key,{cookieOptions:cookieOptions(),cookies:{getAll:()=>request.cookies.getAll(),setAll:items=>{for(const {name,value}of items)request.cookies.set(name,value);response=NextResponse.next({request});for(const {name,value,options}of items)response.cookies.set(name,value,storageCookieOptions(options))}}})
  await client.auth.getUser()
 }
 response.headers.set('Cache-Control','private, no-store');return response
}
export const config={matcher:['/dashboard/:path*','/api/account/:path*','/auth/:path*','/account']}

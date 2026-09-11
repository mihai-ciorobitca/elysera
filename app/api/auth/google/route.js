import {NextResponse} from 'next/server'
import {authClient} from '@/lib/auth/server'
import {sameOrigin,authConfig} from '@/lib/auth/policy.mjs'
import {oauthOrigin} from '@/lib/auth/google-policy.mjs'
import {loginRateLimit} from '@/lib/auth/rate-limit'
export async function POST(request){const reply=(b,s=200)=>NextResponse.json(b,{status:s,headers:{'Cache-Control':'no-store'}});if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403);try{if(!await loginRateLimit(request,'','google'))return reply({error:'Zu viele Versuche. Bitte später erneut versuchen.'},429);const origin=oauthOrigin(request),client=await authClient();const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:origin+'/auth/google/callback',skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}});if(error||!data.url||new URL(data.url).origin!==new URL(authConfig().url).origin)return reply({error:'Google-Anmeldung vorübergehend nicht verfügbar.'},503);return reply({url:data.url})}catch{return reply({error:'Google-Anmeldung vorübergehend nicht verfügbar.'},503)}}

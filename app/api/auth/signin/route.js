import {NextResponse} from 'next/server'
import {authClient,principalFor} from '@/lib/auth/server'
import {sameOrigin,validCredentials} from '@/lib/auth/policy.mjs'
import {loginRateLimit} from '@/lib/auth/rate-limit'
export const dynamic='force-dynamic'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
export async function POST(request){
 if(!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 if(Number(request.headers.get('content-length'))>8192)return reply({error:'Ungültige Eingabe.'},400)
 try{
  const raw=await request.text();if(raw.length>8192)return reply({error:'Ungültige Eingabe.'},400)
  let body;try{body=JSON.parse(raw)}catch{return reply({error:'Ungültige Eingabe.'},400)}
  if(!validCredentials(body))return reply({error:'Bitte E-Mail und Passwort eingeben.'},400)
  const email=body.email.trim().toLowerCase()
  if(!await loginRateLimit(request,email))return reply({error:'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.'},429)
  const client=await authClient();const {error}=await client.auth.signInWithPassword({email,password:body.password})
  if(error)return reply({error:'Anmeldung nicht möglich. Bitte Zugangsdaten und Kontobestätigung prüfen.'},401)
  const {data:assurance,error:mfaError}=await client.auth.mfa.getAuthenticatorAssuranceLevel()
  if(mfaError){await client.auth.signOut({scope:'local'});return reply({error:'Anmeldung derzeit nicht möglich.'},503)}
  if(assurance?.nextLevel==='aal2'&&assurance.currentLevel!=='aal2')return reply({mfaRequired:true},200)
  if(!await principalFor(client)){await client.auth.signOut({scope:'local'});return reply({error:'Dieses Konto kann hier nicht angemeldet werden.'},403)}
  return reply({ok:true,redirect:'/dashboard'})
 }catch{return reply({error:'Die Anmeldung ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.'},503)}
}

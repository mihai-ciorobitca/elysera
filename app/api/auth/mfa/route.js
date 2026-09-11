import {NextResponse} from 'next/server'
import {authClient,principalFor} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {loginRateLimit} from '@/lib/auth/rate-limit'
export async function POST(request){
 const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
 if(!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{
  const body=await request.json();if(!/^\d{6}$/.test(body?.code))return reply({error:'Bitte den sechsstelligen Code eingeben.'},400)
  const client=await authClient();const {data:identity}=await client.auth.getUser();if(!identity.user)return reply({error:'Bitte erneut anmelden.'},401)
  if(!await loginRateLimit(request,identity.user.email))return reply({error:'Zu viele Versuche. Bitte später erneut versuchen.'},429)
  const {data:factorData,error}=await client.auth.mfa.listFactors();const factor=factorData?.totp?.find(f=>f.status==='verified')
  if(error||!factor)return reply({error:'Diese zusätzliche Anmeldemethode ist hier noch nicht verfügbar.'},403)
  const {error:verifyError}=await client.auth.mfa.challengeAndVerify({factorId:factor.id,code:body.code})
  if(verifyError)return reply({error:'Der Code ist ungültig oder abgelaufen.'},401)
  if(!await principalFor(client)){await client.auth.signOut({scope:'local'});return reply({error:'Dieses Konto kann hier nicht angemeldet werden.'},403)}
  return reply({ok:true,redirect:'/dashboard'})
 }catch{return reply({error:'Anmeldung vorübergehend nicht verfügbar.'},503)}
}

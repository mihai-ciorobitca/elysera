import {NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {pendingGoogle} from '@/lib/auth/pending-google'
import {validateDetails} from '@/lib/auth/details-policy.mjs'
import {insertReferralAccount} from '@/lib/auth/referral-account'
import {loginRateLimit} from '@/lib/auth/rate-limit'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function POST(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403);
 try{
  if(!await loginRateLimit(request,'','google-complete'))return reply({error:'Zu viele Versuche. Bitte später erneut versuchen.'},429);
  const identity=await pendingGoogle();if(!identity)return reply({error:'Bitte erneut anmelden.'},401);
  const raw=await request.text();if(raw.length>8192)return reply({error:'Ungültige Eingabe.'},400);
  let body;try{body=JSON.parse(raw)}catch{return reply({error:'Ungültige Eingabe.'},400)}
  const details=validateDetails(body);if(!details)return reply({error:'Bitte vollständigen Namen und Adresse eingeben.'},400);
  const inserted=await insertReferralAccount({id:randomUUID(),email:identity.email.toLowerCase(),name:details.name,last:details.last,identityId:identity.id,verified:true,details,referral:body.referral});
  if(!inserted)return reply({error:'Das Konto besteht bereits. Bitte erneut anmelden.'},409);
  return reply({ok:true});
 }catch(error){if(['REFERRAL_REQUIRED','REFERRAL_INVALID'].includes(error.message))return reply({error:'Bitte einen gültigen ELYSERA Referral-Link oder Empfehlungscode eingeben.'},400);return reply({error:'Registrierung derzeit nicht möglich. Bitte erneut versuchen.'},503)}
}

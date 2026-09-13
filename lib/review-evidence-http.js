import {NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'
import {currentUser,currentAdmin} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {ELYSERA_PRODUCTS} from '@/lib/elysera-products'
import {normalizeEvidence} from './review-evidence-image.mjs'
import {evidenceList,evidenceRead,evidenceMutate} from './review-evidence-service.mjs'
import {uploadEvidence,signEvidence} from './review-evidence-storage'
import {evidenceMaxBytes} from './review-evidence-policy.mjs'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function reviewEvidenceHttp(request,admin,write=false){if(write&&!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const actor=await (admin?currentAdmin():currentUser());if(!actor)return reply({error:'Bitte erneut anmelden.',code:'AUTH_REQUIRED'},401);const ids=ELYSERA_PRODUCTS.map(p=>p.id)
 if(!write){const orderId=new URL(request.url).searchParams.get('id');if(orderId){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId))return reply({error:'Ungültige Bestellung.'},400);return reply({actorId:actor.id,...await evidenceRead(prisma,ids,actor,admin,orderId,signEvidence)})}return reply({actorId:actor.id,...await evidenceList(prisma,ids,actor,admin)})}
 let input,image;if(admin){const text=await request.text();if(text.length>6000)return reply({error:'Anfrage zu groß.'},413);try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Anfrage.'},400)}}else{const size=Number(request.headers.get('content-length'));if(size>evidenceMaxBytes+16384)return reply({error:'Bild darf höchstens 3 MiB groß sein.'},413);const form=await request.formData();if([...form.keys()].some(k=>!['request','file'].includes(k))||form.getAll('request').length!==1||form.getAll('file').length!==1)return reply({error:'Ungültiger Upload.'},400);const raw=form.get('request'),file=form.get('file');if(typeof raw!=='string'||raw.length>6000||!file||typeof file.arrayBuffer!=='function'||file.size>evidenceMaxBytes)return reply({error:'Ungültiger Upload oder Bild zu groß.'},400);try{input=JSON.parse(raw)}catch{return reply({error:'Ungültige Anfrage.'},400)}image=await normalizeEvidence(await file.arrayBuffer(),file.type)}
 return reply(await evidenceMutate(prisma,ids,actor,admin,input,image,uploadEvidence))
 }catch(e){return reply({error:e.status?e.message:'Ergebnis nicht bestätigt. Dieselbe Anfrage erneut versuchen.',code:e.status?e.code:'UNCONFIRMED'},e.status||503)}}

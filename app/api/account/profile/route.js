import {NextResponse} from 'next/server'
import {currentUser,publicProfile} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {prisma} from '@/lib/prisma'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){try{const user=await currentUser();return user?reply({profile:publicProfile(user)}):reply({error:'Bitte anmelden.'},401)}catch{return reply({error:'Kontodaten vorübergehend nicht verfügbar.'},503)}}
export async function PATCH(request){
 if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403)
 try{
  const user=await currentUser();if(!user)return reply({error:'Bitte anmelden.'},401)
  const b=await request.json();if(!b||typeof b.name!=='string'||typeof b.last!=='string'||typeof b.phone!=='string'||!b.name.trim()||b.name.length>80||b.last.length>80||b.phone.length>30||!/^\+?[\d\s()\-]*$/.test(b.phone))return reply({error:'Bitte gültige Profildaten eingeben.'},400)
  const name=b.name.trim(),last=b.last.trim(),phone=b.phone.replace(/\D/g,'')||null
  await prisma.$executeRaw`UPDATE "User" SET "firstName"=${name},"secondName"=${last} WHERE "id"=${user.id}`
  return reply({profile:publicProfile({...user,firstName:name,secondName:last})})
 }catch{return reply({error:'Das Profil konnte nicht gespeichert werden.'},503)}
}

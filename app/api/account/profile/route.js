import {NextResponse} from 'next/server'
import {currentUser} from '@/lib/auth/server'
import {sameOrigin} from '@/lib/auth/policy.mjs'
import {prisma} from '@/lib/prisma'
import {validateDetails} from '@/lib/auth/details-policy.mjs'
import {accountProfile,storeDetails} from '@/lib/auth/details-store'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function GET(){try{const user=await currentUser();return user?reply({profile:await accountProfile(user)}):reply({error:'Bitte anmelden.'},401)}catch{return reply({error:'Kontodaten vorübergehend nicht verfügbar.'},503)}}
export async function PATCH(request){if(!sameOrigin(request))return reply({error:'Nicht zulässig.'},403);try{const user=await currentUser();if(!user)return reply({error:'Bitte anmelden.'},401);const text=await request.text();if(text.length>8192)return reply({error:'Ungültige Eingabe.'},400);let body;try{body=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}const details=validateDetails(body);if(!details)return reply({error:'Bitte vollständigen Namen, Adresse und gültige optionale Angaben eingeben.'},400);await prisma.$transaction(async tx=>{await tx.$executeRaw`UPDATE "User" SET "firstName"=${details.name},"secondName"=${details.last} WHERE "id"=${user.id}`;await storeDetails(tx,user.id,details)});return reply({profile:await accountProfile({...user,firstName:details.name,secondName:details.last})})}catch{return reply({error:'Das Profil konnte nicht gespeichert werden.'},503)}}

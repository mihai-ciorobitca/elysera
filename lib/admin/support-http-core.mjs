export async function supportHttpCore(request,admin,write,deps){
 const {prisma,currentAdmin,currentUser,sameOrigin,reply,supportRead,supportMutate}=deps
 if(write&&!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const actor=await (admin?currentAdmin():currentUser());if(!actor)return reply({error:'Anmeldung erforderlich.'},401)
 if(!admin){const [profile]=await prisma.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${actor.id}`;if(!profile)return reply({error:'ELYSERA-Konto erforderlich.'},403)}
 if(!write)return reply({...await supportRead(prisma,actor,admin,new URL(request.url).searchParams.get('id')),actorId:actor.id})
 const text=await request.text();if(text.length>16000)return reply({error:'Eingabe zu lang.'},400)
 let input;try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Ungültige Eingabe.',code:'INVALID_INPUT'},400)
 if(input.actorId!==actor.id)return reply({error:'Die Anmeldung hat sich geändert. Bitte neu laden.'},403)
 return reply(await supportMutate(prisma,actor,admin,input))
 }catch(e){return reply({error:e.status?e.message:'Support nicht verfügbar. Bitte neu laden und erneut versuchen.',code:e.code||'UNCONFIRMED'},e.status||503)}
}

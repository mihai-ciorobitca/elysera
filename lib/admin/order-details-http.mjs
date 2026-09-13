export async function orderDetailsHttp(request,write,{db,currentAdmin,sameOrigin,ids,reply,read,mutate}){
 if(write&&!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const actor=await currentAdmin();if(!actor)return reply({error:'Administrator-Anmeldung erforderlich.',code:'AUTH_REQUIRED'},401)
 if(!write){const id=new URL(request.url).searchParams.get('id');if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return reply({error:'Bestellung erforderlich.'},400);return reply({actorId:actor.id,state:await db.$transaction(tx=>read(tx,ids,id),{timeout:30000,maxWait:10000})})}
 const text=await request.text();if(text.length>14000)return reply({error:'Eingabe zu lang.'},400)
 let input;try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 return reply(await mutate(db,actor,ids,input))
 }catch(e){return reply({error:e.status?e.message:'Ergebnis nicht bestätigt. Dieselbe Anfrage erneut versuchen.',code:e.status?e.code:'UNCONFIRMED'},e.status||503)}
}

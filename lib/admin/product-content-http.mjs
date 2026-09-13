export async function productContentHttp(request,write,{db,currentAdmin,sameOrigin,reply,read,mutate}){if(write&&!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 try{const actor=await currentAdmin();if(!actor)return reply({error:'Administrator-Anmeldung erforderlich.',code:'AUTH_REQUIRED'},401)
 if(!write)return reply({actorId:actor.id,products:await read(db)})
 const text=await request.text();if(text.length>30000)return reply({error:'Eingabe zu lang.'},400);let input;try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 return reply(await mutate(db,actor,input))
 }catch(e){return reply({error:e.status?e.message:'Ergebnis nicht bestätigt. Dieselbe Anfrage erneut versuchen.',code:e.status?e.code:'UNCONFIRMED'},e.status||503)}}

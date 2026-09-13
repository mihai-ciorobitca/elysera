export async function settingsHttpCore(request,admin,write,{db,currentAdmin,sameOrigin,reply,read,save}){
 if(write&&!sameOrigin(request))return reply({error:'Unzulässige Anfrage.'},403)
 try{const actor=admin?await currentAdmin():null;if(admin&&!actor)return reply({error:'Admin-Anmeldung erforderlich.'},401)
 if(!write)return reply({settings:await read(db),...(admin?{actorId:actor.id}:{})})
 const text=await request.text();if(text.length>12000)return reply({error:'Eingabe zu lang.',code:'INVALID_INPUT'},400)
 let raw;try{raw=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.',code:'INVALID_INPUT'},400)}
 return reply(await save(db,actor,raw))
 }catch(e){return reply({error:e.status?e.message:'Einstellungen nicht verfügbar. Speicherung gegebenenfalls ungeklärt; dieselbe Anfrage erneut prüfen.',code:e.code||'UNCONFIRMED'},e.status||503)}
}

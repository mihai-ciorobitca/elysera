export async function feedbackHttpCore(request,admin,write,{db,currentAdmin,currentUser,sameOrigin,reply,read,mutate}){
 if(write&&!sameOrigin(request))return reply({error:'Unzulässige Anfrage.'},403)
 try{const actor=await (admin?currentAdmin():currentUser());if((admin||write)&&!actor)return reply({error:'Anmeldung erforderlich.'},401)
 let actorId=actor?.id||null;if(!admin&&actorId){const [profile]=await db.$queryRaw`SELECT "userId" FROM public."ElyseraAccountProfile" WHERE "userId"=${actorId}`;if(!profile){if(write)return reply({error:'ELYSERA-Konto erforderlich.'},403);actorId=null}}
 if(!write)return reply({...await read(db,admin,new URL(request.url).searchParams.get('productId')),actorId})
 const text=await request.text();if(text.length>16000)return reply({error:'Eingabe zu lang.'},400)
 let input;try{input=JSON.parse(text)}catch{return reply({error:'Ungültige Eingabe.'},400)}
 return reply(await mutate(db,actor,admin,input))
 }catch(e){return reply({error:e.status?e.message:'Produktfeedback nicht verfügbar. Bitte erneut versuchen.',code:e.code||'UNCONFIRMED'},e.status||503)}
}

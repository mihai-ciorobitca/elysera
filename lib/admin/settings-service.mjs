import {settingsDefaults,settingsInput,SettingsError} from './settings-policy.mjs'
export async function getSiteSettings(db){const [row]=await db.$queryRaw`SELECT * FROM public."ElyseraSiteSettings" WHERE "id"='current'`;if(!row)return {id:'current',version:0,...settingsDefaults};return {id:row.id,version:row.version,...Object.fromEntries(Object.keys(settingsDefaults).map(k=>[k,row.settings[k]??settingsDefaults[k]]))}}
export async function saveSiteSettings(db,actor,raw){const input=settingsInput(raw);if(actor.id!==input.actorId)throw new SettingsError('Anmeldung geändert.',403,'ACTOR_CHANGED');const settings=Object.fromEntries(Object.keys(settingsDefaults).map(k=>[k,input[k]]));const payload=JSON.stringify(input)
 return db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('elysera-site-settings',0))`
  const [prior]=await tx.$queryRaw`SELECT "payload","after" FROM public."ElyseraSiteSettingsAudit" WHERE "actorId"=${actor.id} AND "requestId"=${input.requestId}`
  if(prior){if(Object.keys(input).some(k=>prior.payload[k]!==input[k]))throw new SettingsError('Anfragekennung bereits verwendet.',409,'REQUEST_ID_CONFLICT');return {settings:prior.after,replayed:true}}
  await tx.$executeRaw`INSERT INTO public."ElyseraSiteSettings"("id","settings") VALUES ('current',${JSON.stringify(settingsDefaults)}::jsonb) ON CONFLICT ("id") DO NOTHING`
  const before=await getSiteSettings(tx);if(before.version!==input.expectedVersion)throw new SettingsError('Zwischenzeitlich geändert. Aktuellen Stand laden und Entwurf prüfen.',409,'VERSION_CONFLICT')
  await tx.$executeRaw`UPDATE public."ElyseraSiteSettings" SET "settings"=${JSON.stringify(settings)}::jsonb,"version"="version"+1,"updatedAt"=now() WHERE "id"='current' AND "version"=${input.expectedVersion}`
  const after=await getSiteSettings(tx);if(after.version!==before.version+1||Object.keys(settings).some(k=>settings[k]!==after[k]))throw Error('READBACK_FAILED')
  const [audit]=await tx.$queryRaw`INSERT INTO public."ElyseraSiteSettingsAudit"("actorId","requestId","payload","before","after") VALUES (${actor.id},${input.requestId},${payload}::jsonb,${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb) RETURNING "after"`
  if(!audit||JSON.stringify(audit.after)!==JSON.stringify(after)){if(!audit||Object.keys(after).some(k=>audit.after[k]!==after[k]))throw Error('AUDIT_READBACK_FAILED')}
  return {settings:after}
 },{timeout:30000,maxWait:10000})
}

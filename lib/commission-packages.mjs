import {OWN_IDS} from './admin/reports-model.mjs'

export const ritualPackage={id:'peptide-ritual-set',name:'The Peptide Ritual Set',items:OWN_IDS.map(productId=>({productId,quantity:1}))}
export async function commissionPackages(db){
 const rows=await db.$queryRaw`SELECT id,data FROM public."ElyseraPackage" WHERE data->>'active'='true' AND data->>'archived'='false' ORDER BY id`
 return [ritualPackage,...rows.filter(r=>r.id!==ritualPackage.id).map(r=>({id:r.id,name:r.data.name,items:r.data.items}))]
}
export function validatePurchasedPackage(pack,items){
 if(!pack||!Array.isArray(pack.items)||!pack.items.length||pack.items.some(p=>!OWN_IDS.includes(p.productId)||!Number.isSafeInteger(p.quantity)||p.quantity<1||!items.some(i=>i.id===p.productId&&i.quantity>=p.quantity)))throw Error('Bitte alle Bestandteile des ausgewählten Sets bestellen.')
 return {id:pack.id,name:pack.name,items:pack.items.map(p=>({productId:p.productId,quantity:p.quantity}))}
}

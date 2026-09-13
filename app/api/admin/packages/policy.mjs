export const productIds=['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']
export const productNames=['Renewal Serum · 30 ml','Balance Toner · 100 ml','Contour Eye Cream · 15 ml']
export function validatePackage(v){
 if(!v||Array.isArray(v)||Object.keys(v).sort().join(',')!=='active,archived,description,items,name,slug,sortOrder,tagline')throw Error('INVALID')
 for(const [k,max,min] of [['name',160,1],['slug',100,1],['tagline',300,0],['description',6000,0]])if(typeof v[k]!=='string'||v[k].trim().length<min||v[k].length>max)throw Error('INVALID')
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||!Number.isInteger(v.sortOrder)||Math.abs(v.sortOrder)>100000||typeof v.active!=='boolean'||typeof v.archived!=='boolean'||v.active&&v.archived)throw Error('INVALID')
 if(!Array.isArray(v.items)||v.items.length<1||v.items.length>3||new Set(v.items.map(i=>i?.productId)).size!==v.items.length)throw Error('INVALID')
 for(const i of v.items)if(!i||Object.keys(i).sort().join(',')!=='label,productId,quantity'||!productIds.includes(i.productId)||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>100||typeof i.label!=='string'||i.label.length>160)throw Error('INVALID')
 return {...v,name:v.name.trim(),tagline:v.tagline.trim(),description:v.description.trim(),items:v.items.map(i=>({...i,label:i.label.trim()}))}
}
export function pricing(items,products){
 if(!Array.isArray(items)||!items.length||items.some(i=>!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>100))return {componentCents:null,bundleCents:null,savingsCents:null}
 let componentCents=0
 for(const item of items){const p=products.find(p=>p.id===item.productId);if(!p||p.price===null||p.price===undefined||typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<0||Math.abs(p.price*100-Math.round(p.price*100))>0.00001)return {componentCents:null,bundleCents:null,savingsCents:null};componentCents+=Math.round(p.price*100)*item.quantity}
 if(!Number.isSafeInteger(componentCents)||componentCents>1000000000)return {componentCents:null,bundleCents:null,savingsCents:null}
 const bundleCents=Math.round(componentCents*9/10);return {componentCents,bundleCents,savingsCents:componentCents-bundleCents}
}

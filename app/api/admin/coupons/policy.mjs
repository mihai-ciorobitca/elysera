export const productIds=['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']
export function validateCoupon(v){
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('INVALID')
 const keys=['code','rewardType','percentage','fixedCents','bonusProductId','active','archived','oneTimeOnly','oncePerUser','assignedUserId','startsAt','endsAt','maxRedemptions'];if(Object.keys(v).some(k=>!keys.includes(k))||keys.some(k=>!(k in v)))throw Error('INVALID')
 if(typeof v.code!=='string'||!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(v.code))throw Error('INVALID')
 for(const k of ['active','archived','oneTimeOnly','oncePerUser'])if(typeof v[k]!=='boolean')throw Error('INVALID')
 if(!['DISCOUNT','FIXED_DISCOUNT','FREE_PRODUCT'].includes(v.rewardType))throw Error('INVALID')
 if(v.rewardType==='DISCOUNT'?(!Number.isInteger(v.percentage)||v.percentage<1||v.percentage>100):v.percentage!==null)throw Error('INVALID')
 if(v.rewardType==='FIXED_DISCOUNT'?(!Number.isInteger(v.fixedCents)||v.fixedCents<1||v.fixedCents>10000000):v.fixedCents!==null)throw Error('INVALID')
 if(v.rewardType==='FREE_PRODUCT'?!productIds.includes(v.bonusProductId):v.bonusProductId!==null)throw Error('INVALID')
 if(v.assignedUserId!==null&&(typeof v.assignedUserId!=='string'||!v.assignedUserId.trim()||v.assignedUserId.length>100))throw Error('INVALID')
 for(const k of ['startsAt','endsAt'])if(v[k]!==null&&(typeof v[k]!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v[k])||!Number.isFinite(Date.parse(v[k]))||new Date(v[k]).toISOString()!==v[k]))throw Error('INVALID')
 if(v.startsAt&&v.endsAt&&v.startsAt>=v.endsAt)throw Error('INVALID')
 if(v.maxRedemptions!==null&&(!Number.isInteger(v.maxRedemptions)||v.maxRedemptions<1||v.maxRedemptions>1000000))throw Error('INVALID')
 if(v.archived&&v.active)throw Error('INVALID')
 return Object.fromEntries(keys.map(k=>[k,v[k]]))
}
export function euroCents(value){if(typeof value!=='string'||!/^\d{1,6}([.,]\d{1,2})?$/.test(value))return null;const [a,b='']=value.replace(',','.').split('.');const cents=Number(a)*100+Number(b.padEnd(2,'0'));return cents>0&&cents<=10000000?cents:null}

export const statuses=['PENDING','APPROVED','REJECTED']
export const fields=['answer','locale','question','sortOrder','status']
export function validateFaq(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!==fields.join(','))return null
 const {question,answer,locale,status,sortOrder}=value
 if(typeof question!=='string'||!question.trim()||question.length>2000||typeof answer!=='string'||answer.length>6000||(typeof locale!=='string'||locale.length>12||!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(locale))||!statuses.includes(status)||!Number.isInteger(sortOrder)||Math.abs(sortOrder)>100000||status==='APPROVED'&&!answer.trim())return null
 return {question:question.trim(),answer:answer.trim(),locale,status,sortOrder}
}
export function validateUpdate(body){return body&&Object.keys(body).sort().join(',')==='changes,expectedVersion'&&Number.isSafeInteger(body.expectedVersion)&&body.expectedVersion>0?validateFaq(body.changes):null}

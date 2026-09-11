const fields={name:80,last:80,street:160,houseNumber:30,postalCode:24,city:100,country:100,phone:30,birthDate:10,gender:20}
export function validateDetails(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null
 const out={};for(const [key,max]of Object.entries(fields)){const v=input[key]??'';if(typeof v!=='string'||v.length>max)return null;out[key]=v.trim()}
 if(['name','last','street','houseNumber','postalCode','city','country'].some(k=>!out[k]))return null
 if(out.phone&&!/^\+?[\d ()-]{5,30}$/.test(out.phone))return null
 if(!['','female','male','diverse','undisclosed'].includes(out.gender))return null
 if(out.birthDate){if(!/^\d{4}-\d{2}-\d{2}$/.test(out.birthDate))return null;const d=new Date(out.birthDate);if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==out.birthDate||d>new Date()||d.getUTCFullYear()<1900)return null}
 return out
}
export function detailsComplete(profile){return Boolean(validateDetails(profile))}

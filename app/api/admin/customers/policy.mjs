const fields={street:160,houseNumber:30,postalCode:24,city:100,country:100,phone:30}
export function validateContact(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!Object.hasOwn(fields,k)))return null
 const result={};for(const [key,max]of Object.entries(fields)){if(typeof input[key]!=='string'||input[key].length>max||/[\u0000-\u001f\u007f]/.test(input[key]))return null;result[key]=input[key].trim()}
 if(Object.keys(fields).filter(k=>k!=='phone').some(k=>!result[k]))return null
 if(result.phone&&!/^\+?[\d ()-]{5,30}$/.test(result.phone))return null
 return result
}

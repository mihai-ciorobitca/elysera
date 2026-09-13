export const productSelect={id:true,name:true,price:true,stock:true,active:true}
export function validateProduct(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='active,name,price,stock')return null
 const {name,price,stock,active}=value
 if(typeof name!=='string'||name.trim().length<2||name.trim().length>160||/[\x00-\x1f]/.test(name)||typeof price!=='number'||!Number.isFinite(price)||price<0||price>100000||Math.abs(price*100-Math.round(price*100))>1e-6||!Number.isInteger(stock)||stock<0||stock>1000000||typeof active!=='boolean')return null
 return {name:name.trim(),price,stock,active}
}

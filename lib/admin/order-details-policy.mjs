export class OrderDetailsError extends Error {constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export const orderCategories=['STANDARD','URGENT']
export const orderDetailFields={shippingName:{label:'Empfängername',max:200},shippingAddress1:{label:'Straße und Hausnummer',max:300},shippingAddress2:{label:'Adresszusatz',max:300},shippingPostalCode:{label:'Postleitzahl',max:40},shippingCity:{label:'Ort',max:150},shippingState:{label:'Region / Bundesland',max:150},shippingCountry:{label:'Land',max:100},adminComment:{label:'Interner Administratorkommentar',max:2000}}
export function orderDetailsInput(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['actorId','orderId','requestId','expected','orderCategory','reason',...Object.keys(orderDetailFields)].includes(k)))throw new OrderDetailsError('Ungültige Eingabe.')
 for(const k of ['actorId','orderId','requestId'])if(typeof raw[k]!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(raw[k]))throw new OrderDetailsError('Ungültige Anfragekennung.')
 if(raw.requestId.length<16)throw new OrderDetailsError('Anfragekennung zu kurz.')
 const e=raw.expected;if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).sort().join(',')!=='status,xmin'||typeof e.xmin!=='string'||!/^\d+$/.test(e.xmin)||typeof e.status!=='string'||!e.status||e.status.length>80)throw new OrderDetailsError('Bestellversion erforderlich.')
 if(!orderCategories.includes(raw.orderCategory))throw new OrderDetailsError('Ungültige Bestellkategorie.')
 if(typeof raw.reason!=='string'||!raw.reason.trim()||raw.reason.length>500)throw new OrderDetailsError('Begründung mit maximal 500 Zeichen erforderlich.')
 const input={actorId:raw.actorId,orderId:raw.orderId,requestId:raw.requestId,expected:{xmin:e.xmin,status:e.status},orderCategory:raw.orderCategory,reason:raw.reason.trim()}
 for(const [key,{max}] of Object.entries(orderDetailFields)){if(typeof raw[key]!=='string'||raw[key].length>max)throw new OrderDetailsError('Ungültiges oder zu langes Adress-/Kommentarfeld.');input[key]=raw[key].trim()}
 return input
}
export function orderDetailsScope(items,ids){if(!items.length||items.some(i=>!i.productId||!ids.includes(i.productId)))throw new OrderDetailsError('ELYSERA-Bestellung nicht gefunden.',404,'OUT_OF_SCOPE')}
export function orderDetailsVersion(state,input){if(state.xmin!==input.expected.xmin||state.status!==input.expected.status)throw new OrderDetailsError('Bestellung wurde geändert. Aktuellen Stand laden und erneut prüfen.',409,'STALE_VERSION')}

export class OrderActionError extends Error {constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export const orderTransitions={PENDING:['PAID','ISSUE','CANCELLED'],AWAITING_BANK_TRANSFER:['PAID','ISSUE','CANCELLED'],AWAITING_STRIPE:['PAID','ISSUE','CANCELLED'],AWAITING_PAYPAL:['PAID','ISSUE','CANCELLED'],AWAITING_PAY_ON_DELIVERY:['PAID','ISSUE','CANCELLED'],PAID:['PACKED','ISSUE'],PACKED:['SHIPPED','ISSUE'],SHIPPED:['DELIVERED','ISSUE'],DELIVERED:['ISSUE'],ISSUE:[],CANCELLED:[]}
export function orderActionInput(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['actorId','orderId','requestId','expected','status','trackingNumber','trackingCarrier','note','reason','paymentReceived'].includes(k)))throw new OrderActionError('Ungültige Eingabe.')
 for(const k of ['actorId','orderId','requestId'])if(typeof raw[k]!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(raw[k]))throw new OrderActionError('Ungültige Anfragekennung.')
 if(raw.requestId.length<16)throw new OrderActionError('Anfragekennung zu kurz.')
 const e=raw.expected;if(!e||Object.keys(e).sort().join(',')!=='status,version,xmin'||!Number.isSafeInteger(e.version)||e.version<0||typeof e.xmin!=='string'||!/^\d+$/.test(e.xmin)||!Object.hasOwn(orderTransitions,e.status))throw new OrderActionError('Bestellversion erforderlich.')
 if(!Object.hasOwn(orderTransitions,raw.status))throw new OrderActionError('Ungültiger Status.')
 for(const [k,max] of [['trackingNumber',150],['trackingCarrier',100],['note',2000],['reason',500]])if(typeof raw[k]!=='string'||raw[k].length>max)throw new OrderActionError('Feld zu lang oder ungültig.')
 if(!raw.reason.trim())throw new OrderActionError('Bitte eine Begründung eingeben.')
 if(raw.paymentReceived!==undefined&&typeof raw.paymentReceived!=='boolean')throw new OrderActionError('Zahlungseingang ungültig.');
 if(raw.status==='PAID'&&raw.expected.status!=='PAID'&&raw.paymentReceived!==true)throw new OrderActionError('Bitte den tatsächlich erhaltenen Zahlungseingang bestätigen.');
 return {...(raw.paymentReceived!==undefined?{paymentReceived:raw.paymentReceived}:{}),actorId:raw.actorId,orderId:raw.orderId,requestId:raw.requestId,status:raw.status,expected:{xmin:e.xmin,status:e.status,version:e.version},trackingNumber:raw.trackingNumber.trim(),trackingCarrier:raw.trackingCarrier.trim(),note:raw.note.trim(),reason:raw.reason.trim()}
}
export function orderActionScope(items,ids){if(!items.length||items.some(i=>!i.productId||!ids.includes(i.productId)))throw new OrderActionError('ELYSERA-Bestellung nicht gefunden.',404,'OUT_OF_SCOPE')}
export function orderActionVersion(state,input){if(state.xmin!==input.expected.xmin||state.status!==input.expected.status||state.version!==input.expected.version)throw new OrderActionError('Bestellung wurde geändert. Aktuellen Stand laden und erneut prüfen.',409,'STALE_VERSION')
 if(input.status!==state.status&&!orderTransitions[state.status]?.includes(input.status))throw new OrderActionError('Dieser Statuswechsel ist hier nicht verfügbar.',409,'INVALID_TRANSITION')}

export function orderPaymentAmount(state){const total=Number(state.total),discount=Number(state.discount??0),outstanding=Number(state.outstandingEur);if(state.paidAt||state.outstandingEur==null||![total,discount,outstanding].every(Number.isFinite)||total<=0||discount<0||discount>total||outstanding<=0||Math.abs(total*100-Math.round(total*100))>0.00001||Math.abs(outstanding*100-Math.round(outstanding*100))>0.00001||outstanding>total-discount+0.00001)throw new OrderActionError("Kein gültiger offener Zahlbetrag. Bitte den aktuellen Bestellstand prüfen.",409,"INVALID_PAYMENT");return Math.round(outstanding*100)}

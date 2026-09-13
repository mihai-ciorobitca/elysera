export class FeedbackError extends Error{constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export const feedbackProducts=['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']
export function feedbackInput(raw,admin){
 const fields=admin?['actorId','requestId','id','version','status','reply']:['actorId','requestId','productId','kind','body','rating']
 if(!raw||Array.isArray(raw)||typeof raw!=='object'||Object.keys(raw).some(k=>!fields.includes(k)))throw new FeedbackError('Ungültige Felder.')
 if(typeof raw.actorId!=='string'||typeof raw.requestId!=='string'||! /^[0-9a-f-]{36}$/i.test(raw.requestId))throw new FeedbackError('Anfragekennung fehlt.')
 if(admin){if(typeof raw.id!=='string'||raw.id.length>100||!Number.isSafeInteger(raw.version)||raw.version<1||typeof raw.reply!=='string'||raw.reply.length>8000||!['OPEN','ANSWERED','HIDDEN','PENDING','APPROVED','REJECTED'].includes(raw.status))throw new FeedbackError('Ungültige Moderation.');return {...raw,reply:raw.reply.trim()}}
 if(!feedbackProducts.includes(raw.productId)||!['question','review'].includes(raw.kind)||typeof raw.body!=='string'||raw.body.trim().length<5||raw.body.length>4000)throw new FeedbackError('Produkt und Text prüfen.')
 if(raw.kind==='review'?(!Number.isInteger(raw.rating)||raw.rating<1||raw.rating>5):(raw.rating!==undefined&&raw.rating!==null))throw new FeedbackError('Bewertung prüfen.')
 return {...raw,body:raw.body.trim(),rating:raw.kind==='review'?raw.rating:null}
}
export function feedbackTransition(row,input){if(!row||!feedbackProducts.includes(row.productId))throw new FeedbackError('Eintrag nicht gefunden.',404);if(row.version!==input.version)throw new FeedbackError('Zwischenzeitlich geändert. Neu laden und Entwurf vergleichen.',409,'VERSION_CONFLICT');if(!(row.kind==='question'?['OPEN','ANSWERED','HIDDEN']:['PENDING','APPROVED','REJECTED']).includes(input.status)||input.status==='ANSWERED'&&!input.reply)throw new FeedbackError('Status und Antwort passen nicht zusammen.')}

export const supportStatuses=['open','in_progress','resolved','closed']
export class SupportError extends Error {constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export function supportInput(input,admin){
 if(!input||typeof input!=='object')throw new SupportError('Ungültige Eingabe.')
 if(Object.keys(input).some(key=>!['action','actorId','ticketId','expectedVersion','status','subject','body','requestId'].includes(key)))throw new SupportError('Unbekannte Eingabefelder.')
 const action=input.action
 if(!(admin?['reply','status','archive','restore']:['create','reply']).includes(action))throw new SupportError('Aktion nicht zulässig.',403)
 if(action!=='create'&&(!Number.isSafeInteger(input.expectedVersion)||input.expectedVersion<1||typeof input.ticketId!=='string'||input.ticketId.length>100))throw new SupportError('Ticket und Version erforderlich.')
 if(['reply','create'].includes(action)&&(!/^[a-zA-Z0-9-]{16,100}$/.test(input.requestId||'')||typeof input.body!=='string'||!input.body.trim()||input.body.length>10000))throw new SupportError('Nachricht (1–10.000 Zeichen) und Anfragekennung erforderlich.')
 if(action==='create'&&(typeof input.subject!=='string'||!input.subject.trim()||input.subject.length>200))throw new SupportError('Betreff (1–200 Zeichen) erforderlich.')
 if(action==='status'&&!supportStatuses.includes(input.status))throw new SupportError('Ungültiger Status.')
 return {...input,body:input.body?.trim(),subject:input.subject?.trim()}
}
export function supportAccess(ticket,actor,admin){if(!ticket||(!admin&&ticket.userId!==actor.id))throw new SupportError('Ticket nicht gefunden.',404)}
export function supportVersion(ticket,input){if(ticket.version!==input.expectedVersion)throw new SupportError('Ticket wurde inzwischen geändert. Bitte neu laden.',409,'STALE_VERSION')}

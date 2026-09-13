export const membershipLabels={NONE:'Keine Mitgliedschaft',MEMBER:'Member',PREMIUM:'Premium',AFFILIATE:'Affiliate',DIAMOND:'Diamond'}
export function validateMembership(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).sort().join(',')!=='customerId,expectedVersion,reason,status')throw Error('Ungültige Eingabe.')
 if(typeof input.customerId!=='string'||!input.customerId||input.customerId.length>100||!Object.hasOwn(membershipLabels,input.status)||!Number.isSafeInteger(input.expectedVersion)||input.expectedVersion<0||typeof input.reason!=='string'||!input.reason.trim()||input.reason.length>500)throw Error('Bitte Mitgliedschaft und Begründung prüfen.')
 return {...input,reason:input.reason.trim()}
}

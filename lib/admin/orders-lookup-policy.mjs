export const lookupStatuses=['PENDING','PAID','PACKED','SHIPPED','DELIVERED','CANCELLED','ISSUE','AWAITING_BANK_TRANSFER','AWAITING_STRIPE','AWAITING_PAY_ON_DELIVERY']
export function parseOrderLookup(params){
 const fail=message=>{throw Object.assign(new Error(message),{status:400})}
 const q=(params.get('q')||'').trim().replace(/^#+/,'').trim(),status=params.get('status')||'all'
 if(q.length>200||/[\u0000-\u001f]/.test(q))fail('Suchbegriff ist ungültig.')
 if(status!=='all'&&!lookupStatuses.includes(status))fail('Bestellstatus ist ungültig.')
 const day=key=>{const value=params.get(key)||'';if(!value)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail('Datum ist ungültig.');return new Date(value+'T00:00:00.000Z')}
 const from=day('from'),last=day('to'),to=last?new Date(last.getTime()+86400000):null
 if(from&&last&&from>last)fail('Das Enddatum muss nach dem Startdatum liegen.')
 if(q.length<2&&status==='all'&&!from&&!to)fail('Mindestens zwei Zeichen oder einen Filter eingeben.')
 const page=Number(params.get('page')||1)
 if(!Number.isSafeInteger(page)||page<1||page>1000000)fail('Seite ist ungültig.')
 return {q:q.toLowerCase(),status,from,to,page,pageSize:20}
}

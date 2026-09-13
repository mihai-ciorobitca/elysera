export const PAID = ['PAID','PACKED','SHIPPED','DELIVERED']
export const PENDING = ['PENDING','AWAITING_BANK_TRANSFER','AWAITING_STRIPE','AWAITING_PAY_ON_DELIVERY']
export function summarize(rows){
 const sum=statuses=>rows.filter(r=>statuses.includes(r.status)).reduce((s,r)=>s+Math.round(Number(r.total)*100),0)/100
 return {count:rows.length,paid:sum(PAID),pending:sum(PENDING),paidCount:rows.filter(r=>PAID.includes(r.status)).length,pendingCount:rows.filter(r=>PENDING.includes(r.status)).length,refunds:null,netCash:null}
}
export function periodStart(period,now=new Date()){
 if(!['7','30','90','365'].includes(period))throw Error('INVALID_PERIOD')
 const start=new Date(now);start.setUTCHours(0,0,0,0);start.setUTCDate(start.getUTCDate()-Number(period)+1);return start
}

export function dailyValues(rows){
 const days=new Map()
 for(const row of rows){const date=new Date(row.createdAt).toISOString().slice(0,10);const item=days.get(date)||{date,paid:0,pending:0};if(PAID.includes(row.status))item.paid+=Math.round(Number(row.total)*100);if(PENDING.includes(row.status))item.pending+=Math.round(Number(row.total)*100);days.set(date,item)}
 return [...days.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(r=>({...r,paid:r.paid/100,pending:r.pending/100}))
}
export function csvCell(value){return '"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"'}

export const OWN_IDS=['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']
export const PAID=['PAID','PACKED','SHIPPED','DELIVERED']
const DAY=86400000
const safe=n=>{if(!Number.isSafeInteger(n))throw Error('INVALID_AMOUNT');return n}
export function cents(value){const s=String(value);if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('INVALID_AMOUNT');const [a,b='']=s.split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n))throw Error('INVALID_AMOUNT');return n}
export function scopeOrder(order){return Array.isArray(order.items)&&order.items.length>0&&order.items.every(i=>OWN_IDS.includes(i.productId))}
export function rangeDates(params,now=new Date()){
 const range=params.get('range')||'month';let start,end=new Date(now.getTime()+1)
 const month=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1))
 if(range==='month')start=month
 else if(range==='previousMonth'){start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1));end=month}
 else if(range==='week'){start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7)}
 else if(['7','30','90'].includes(range)){end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));start=new Date(+end-Number(range)*DAY)}
 else if(['24h','lastMonth','7','30','90'].includes(range))start=new Date(now.getTime()-(range==='24h'?1:range==='lastMonth'?30:Number(range))*DAY)
 else if(range==='all')start=new Date(0)
 else if(range==='custom'){const parse=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))throw Error('INVALID_RANGE');const d=new Date(x+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==x)throw Error('INVALID_RANGE');return d};start=parse(params.get('start'));end=new Date(+parse(params.get('end'))+DAY);if(+end>+now+DAY)throw Error('INVALID_RANGE')}
 else throw Error('INVALID_RANGE')
 if(start>=end)throw Error('INVALID_RANGE');return {range,start,end,days:Math.max(1,(end-start)/DAY)}
}
export function validateCosts(body){if(!body||Object.keys(body).sort().join(',')!=='costs,expectedVersion'||!Number.isInteger(body.expectedVersion)||body.expectedVersion<0||!body.costs||Object.keys(body.costs).length!==3)throw Error('INVALID');for(const id of OWN_IDS){const n=body.costs[id];if(n!==null&&(!Number.isSafeInteger(n)||n<0||n>100000000))throw Error('INVALID')}if(Object.keys(body.costs).some(id=>!OWN_IDS.includes(id)))throw Error('INVALID');return body}
export function reportSnapshot(raw,config,range){
 const orders=raw.filter(scopeOrder).map(o=>{const items=o.items.map(i=>{if(!Number.isSafeInteger(i.quantity)||i.quantity<1)throw Error('INVALID_QUANTITY');const unitCents=cents(i.price),unitCost=config.costs[i.productId]??null;return {...i,unitCents,lineCents:safe(unitCents*i.quantity),costCents:unitCost===null?null:safe(unitCost*i.quantity)}});const costCents=items.some(i=>i.costCents===null)?null:items.reduce((a,i)=>safe(a+i.costCents),0);const totalCents=cents(o.total);return {id:o.id,createdAt:o.createdAt,status:o.status,totalCents,items,costCents,contributionCents:costCents===null?null:totalCents-costCents}})
 const paid=orders.filter(o=>PAID.includes(o.status)),sum=(rows,key)=>rows.reduce((s,o)=>safe(s+o[key]),0)
 const products=OWN_IDS.map(id=>{const lines=paid.flatMap(o=>o.items).filter(i=>i.productId===id);return {id,name:lines[0]?.name||id.replace('elysera-',''),quantity:sum(lines,'quantity'),lineCents:sum(lines,'lineCents'),costCents:lines.length&&lines.some(i=>i.costCents===null)?null:sum(lines,'costCents')}})
 const totalCents=sum(paid,'totalCents'),costCents=paid.some(o=>o.costCents===null)?null:sum(paid,'costCents')
 return {orders,products,config,range:{range:range.range,start:range.start.toISOString(),end:range.end.toISOString(),days:range.days},summary:{count:orders.length,paidCount:paid.length,totalCents,costCents,contributionCents:costCents===null?null:totalCents-costCents,refundsCents:null,cashCents:null,taxCents:null,commissionsCents:null,netProfitCents:null}}
}
export function forecast(snapshot,basis=30,growth=0){if(![7,30,90].includes(basis)||!Number.isFinite(growth)||growth< -8||growth>12)throw Error('INVALID_FORECAST');const end=new Date(snapshot.range.end),start=+end-basis*DAY;const rows=snapshot.orders.filter(o=>PAID.includes(o.status)&&+new Date(o.createdAt)>=start&&+new Date(o.createdAt)<+end);const days=Array.from({length:basis},(_,i)=>{const a=start+i*DAY,b=a+DAY,r=rows.filter(o=>+new Date(o.createdAt)>=a&&+new Date(o.createdAt)<b);return {date:new Date(a).toISOString().slice(0,10),totalCents:r.reduce((s,o)=>s+o.totalCents,0)}});const total=rows.reduce((s,o)=>s+o.totalCents,0),cost=rows.some(o=>o.costCents===null)?null:rows.reduce((s,o)=>s+o.costCents,0);return {days,sampleDays:days.filter(d=>d.totalCents>0).length,projections:[7,30,91,182,365,1825].map(horizon=>{let factor=0;for(let d=0;d<horizon;d++)factor+=(1+growth/100)**(d/7);const project=n=>{const value=Math.round(n/basis*factor);return rows.length&&Number.isSafeInteger(value)?value:null};return {horizon,orders:project(rows.length),revenueCents:project(total),contributionCents:cost===null?null:project(total-cost)}})}}

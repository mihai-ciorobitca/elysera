export const orderStatus={PENDING:'Offen',AWAITING_BANK_TRANSFER:'Offen',AWAITING_STRIPE:'Offen',AWAITING_PAY_ON_DELIVERY:'Offen',PAID:'Bezahlt',PACKED:'Gepackt',SHIPPED:'Versendet',DELIVERED:'Geliefert',CANCELLED:'Storniert',ISSUE:'In Klärung'}
export const commissionStatus={MISSED:'Nicht berechtigt',LOCKED:'Gesperrt',PENDING:'Vorgemerkt',REQUESTED:'Angefragt',APPROVED:'Freigegeben',PAID:'Ausgezahlt'}
export const productNames={'elysera-renewal-serum-30ml':'Renewal Serum','elysera-balance-toner-100ml':'Balance Prepeptide Toner','elysera-contour-eye-cream-15ml':'Contour Lift Eye Cream'}
export const paidStates=new Set(['PAID','PACKED','SHIPPED','DELIVERED'])
export function buildStats(data,now=new Date()){
 const orders=data.orders||[],commissions=data.commissions||[],paid=orders.filter(o=>paidStates.has(o.status))
 const products=Object.entries(productNames).map(([id,name])=>({id,name,amount:paid.reduce((total,o)=>total+(o.items||[]).filter(i=>i.productId===id).reduce((n,i)=>n+Number(i.price)*i.quantity,0),0)}))
 const months=Array.from({length:6},(_,i)=>new Date(now.getFullYear(),now.getMonth()-5+i,1))
 return {products,total:products.reduce((n,p)=>n+p.amount,0),orderCount:orders.length,commission:commissions.filter(c=>c.status!=='MISSED').reduce((n,c)=>n+c.amount,0),paidCommission:commissions.filter(c=>c.status==='PAID').reduce((n,c)=>n+c.amount,0),labels:months.map(d=>d.toLocaleDateString('de-DE',{month:'short'})),values:months.map(d=>paid.filter(o=>{const date=new Date(o.createdAt);return date.getMonth()===d.getMonth()&&date.getFullYear()===d.getFullYear()}).reduce((n,o)=>n+(o.items||[]).reduce((sum,i)=>sum+Number(i.price)*i.quantity,0),0))}
}

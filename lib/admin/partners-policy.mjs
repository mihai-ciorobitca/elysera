export function partnerGraph(accounts,relationships){
 const own=new Map(accounts.map(a=>[a.id,a])),links=new Map();
 for(const r of relationships){if(!own.has(r.userId)||r.parentUserId&&!own.has(r.parentUserId))continue;links.set(r.userId,r)}
 return accounts.map(a=>{const r=links.get(a.id);const chain=[];const seen=new Set([a.id]);let next=r?.parentUserId,cycle=false;
 while(next){if(seen.has(next)){cycle=true;break}seen.add(next);chain.push(next);next=links.get(next)?.parentUserId}
 return {...a,partnerStatus:r?.status||'unconfigured',parentId:r?.parentUserId||null,ancestors:cycle?[]:chain,relationshipConflict:cycle};
 })
}
export function exclusivelyOwnOrder(items,productIds){const allowed=new Set(productIds);return items.length>0&&items.every(i=>i.productId!=null&&allowed.has(i.productId))}
export function eligibleCommission(c,ownAccountIds,productIds){return ownAccountIds.includes(c.userId)&&c.order&&ownAccountIds.includes(c.order.userId)&&exclusivelyOwnOrder(c.order.items,productIds)}

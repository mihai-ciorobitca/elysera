export function partnerGraph(accounts,relationships){
 const own=new Map(accounts.map(a=>[a.id,a])),links=new Map();
 for(const r of relationships){if(own.has(r.userId))links.set(r.userId,r)}
 return accounts.map(a=>{const r=links.get(a.id);const chain=[];const seen=new Set([a.id]);let next=r?.parentUserId,conflict=false;
 while(next){if(seen.has(next)||!own.has(next)){conflict=true;break}seen.add(next);chain.push(next);next=links.get(next)?.parentUserId}
 return {...a,partnerStatus:r?.status||'unconfigured',parentId:own.has(r?.parentUserId)?r.parentUserId:null,ancestors:conflict?[]:chain,relationshipConflict:conflict};
 })
}
// Index once per response; filtering/pagination must never discard graph context.
export function partnerIndex(partners){
 const lookup=new Map(partners.map(p=>[p.id,p])),children=new Map(),descendants=new Map();
 for(const p of partners){
  const parent=p.relationshipConflict?null:p.parentId;
  if(!children.has(parent))children.set(parent,[]);
  children.get(parent).push(p);
  if(!p.relationshipConflict)for(const id of p.ancestors||[])descendants.set(id,(descendants.get(id)||0)+1);
 }
 return {lookup,children,descendants};
}
export function partnerView(partners,{view='list',focus=null,search='',filter='all',page=1,pageSize=25}={}){
 const query=search.trim().toLocaleLowerCase('de-DE');
 const global=!!query||filter!=='all';
 const visible=partners.filter(p=>(view!=='network'||global||(p.relationshipConflict?null:p.parentId)===focus)&&
  (filter==='all'||(filter==='conflict'?p.relationshipConflict:p.partnerStatus===filter))&&
  [p.firstName,p.secondName,p.email,p.id].join(' ').toLocaleLowerCase('de-DE').includes(query));
 const pages=Math.max(1,Math.ceil(visible.length/pageSize)),current=Math.max(1,Math.min(page,pages));
 return {visible,rows:visible.slice((current-1)*pageSize,current*pageSize),pages,current,global};
}
export function exclusivelyOwnOrder(items,productIds){const allowed=new Set(productIds);return items.length>0&&items.every(i=>i.productId!=null&&allowed.has(i.productId))}
export function eligibleCommission(c,ownAccountIds,productIds){return ownAccountIds.includes(c.userId)&&c.order&&ownAccountIds.includes(c.order.userId)&&exclusivelyOwnOrder(c.order.items,productIds)}

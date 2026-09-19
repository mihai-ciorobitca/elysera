// Only public editorial data belongs here. Never cache accounts, stock or prices.
const endpoints = new Set(['/api/product-content', '/api/product-merchandising'])
export function createPublicCatalogLoader({fetcher=(...args)=>fetch(...args),now=()=>Date.now(),ttl=30000}={}) {
 const cache=new Map()
 return function load(url) {
  if(!endpoints.has(url))return Promise.reject(new Error('Not a public catalog endpoint'))
  const current=cache.get(url)
  if(current?.pending)return current.pending
  if(current&&current.expires>now())return Promise.resolve(current.value)
  const entry={}
  entry.pending=(async()=>{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
   try {
    const response=await fetcher(url,{cache:'no-store',signal:controller.signal})
    if(!response.ok)throw new Error('Catalog unavailable')
    const value=await response.json()
    cache.set(url,{value,expires:now()+ttl})
    return value
   } catch(error){cache.delete(url);throw error}
   finally{clearTimeout(timer)}
  })()
  cache.set(url,entry)
  return entry.pending
 }
}
export const loadPublicCatalog=createPublicCatalogLoader()

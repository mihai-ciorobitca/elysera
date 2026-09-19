import {prisma} from '../lib/prisma'
import {publicPages,siteUrl,indexable} from '../lib/seo.mjs'
import {products,ritualSet} from './catalog'
export const dynamic='force-dynamic'
export default async function sitemap(){if(!indexable)return [];const articles=await prisma.$queryRaw`SELECT "slug","updatedAt" FROM public."ElyseraNews" WHERE "status"='PUBLISHED' AND "publishedAt"<=now() ORDER BY "publishedAt" DESC LIMIT 40000`;return [...Object.keys(publicPages).map(path=>({url:siteUrl+(path==='/'?'':path)})),...[...products,ritualSet].map(p=>({url:siteUrl+'/products/'+p.slug})),...articles.map(a=>({url:siteUrl+'/news/'+a.slug,lastModified:a.updatedAt}))]}

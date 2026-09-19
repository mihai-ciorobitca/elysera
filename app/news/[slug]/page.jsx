import {cache} from 'react'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {prisma} from '@/lib/prisma'
import {getNews} from '@/lib/news-service.mjs'
import {pageMetadata,siteUrl} from '@/lib/seo.mjs'
import StructuredData from '../../structured-data'
import NewsBody from '../news-body'
import '../news.css'
export const dynamic='force-dynamic'
const read=cache(slug=>getNews(prisma,slug))
export async function generateMetadata({params}){const {slug}=await params;const a=await read(slug);if(!a)notFound();const meta=pageMetadata(a.seoTitle||a.title,a.seoDescription||a.excerpt,'/news/'+a.slug,a.image||undefined);return {...meta,openGraph:{...meta.openGraph,type:'article',publishedTime:new Date(a.publishedAt).toISOString(),modifiedTime:new Date(a.updatedAt).toISOString()}}}
export default async function Article({params}){const {slug}=await params,a=await read(slug);if(!a)notFound();const url=siteUrl+'/news/'+a.slug;return <article className="news-article"><nav aria-label="Brotkrümelnavigation"><Link href="/">Startseite</Link><span> / </span><Link href="/news">News</Link></nav><header><time dateTime={new Date(a.publishedAt).toISOString()}>{new Date(a.publishedAt).toLocaleDateString('de-DE')}</time><h1>{a.title}</h1><p className="news-intro">{a.excerpt}</p><p className="news-byline">ELYSERA Redaktion</p></header>{a.image&&<img className="news-cover" src={a.image} alt={a.imageAlt} width="1120" height="700" fetchPriority="high"/>}<NewsBody body={a.body}/><footer><Link href="/news">← Alle News</Link><Link href="/shop">Die Kollektion entdecken →</Link></footer><StructuredData data={{'@context':'https://schema.org','@type':'NewsArticle',headline:a.title,description:a.excerpt,mainEntityOfPage:url,datePublished:new Date(a.publishedAt).toISOString(),dateModified:new Date(a.updatedAt).toISOString(),author:{'@type':'Organization',name:'ELYSERA Redaktion',url:siteUrl+'/about'},publisher:{'@type':'Organization',name:'ELYSERA',url:siteUrl},...(a.image?{image:[siteUrl+a.image]}:{})}}/><StructuredData data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Startseite',item:siteUrl},{'@type':'ListItem',position:2,name:'News',item:siteUrl+'/news'},{'@type':'ListItem',position:3,name:a.title,item:url}]}}/></article>}

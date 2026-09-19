import {pageMetadata,siteUrl} from '../../../lib/seo.mjs'
import StructuredData from '../../structured-data'
import {notFound} from 'next/navigation'
import {products} from '../../catalog'
import ProductDetailView from '../../product-detail-view'
import {getPublishedProductCatalog} from '../../../lib/product-content-server'
export function generateStaticParams(){return products.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}){const {slug}=await params;const catalog=await getPublishedProductCatalog();const p=catalog.find(p=>p.slug===slug);if(!p)notFound();return pageMetadata(p.name,p.description,'/products/'+slug,p.image)}
export default async function Product({params}){const {slug}=await params;if(!products.some(p=>p.slug===slug))notFound();const catalog=await getPublishedProductCatalog(),product=catalog.find(p=>p.slug===slug);return <><StructuredData data={{'@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,image:new URL(product.image,siteUrl).href,brand:{'@type':'Brand',name:'ELYSERA'},url:siteUrl+'/products/'+slug}}/><ProductDetailView product={product} initialProducts={catalog}/></>}

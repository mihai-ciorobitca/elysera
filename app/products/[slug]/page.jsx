import {notFound} from 'next/navigation'
import {products} from '../../catalog'
import ProductDetailView from '../../product-detail-view'
import {getPublishedProductCatalog} from '../../../lib/product-content-server'
export function generateStaticParams(){return products.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}){const {slug}=await params;const catalog=await getPublishedProductCatalog();return {title:catalog.find(p=>p.slug===slug)?.name||'Produkt'}}
export default async function Product({params}){const {slug}=await params;if(!products.some(p=>p.slug===slug))notFound();const catalog=await getPublishedProductCatalog(),product=catalog.find(p=>p.slug===slug);return <ProductDetailView product={product} initialProducts={catalog}/>}

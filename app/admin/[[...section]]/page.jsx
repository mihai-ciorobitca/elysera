import {redirect,notFound} from 'next/navigation'
import {currentAdmin} from '@/lib/auth/server'
import AdminPanel from '../panel'
import {modules} from '../modules'
import {EMAIL_TEMPLATES} from '../../../lib/admin/email-previews.mjs'
import '../panel.css'
export const dynamic='force-dynamic'
export const metadata={title:'Administration',robots:{index:false,follow:false}}
export default async function Page({params,searchParams}){
 const user=await currentAdmin()
 if(!user)redirect('/auth/admin')
 if(user.role!=='ADMIN')return <main style={{padding:40}}>Dieser Bereich ist nur für Administratoren zugänglich.</main>
 const {section=[]}=await params;const emailTemplateId=section.length===2&&section[0]==='emails'?section[1]:null;const productContent=section.length===2&&section[0]==='products'&&section[1]==='content';const orderCreate=section.length===2&&section[0]==='orders'&&section[1]==='create';const productMerchandising=section.length===2&&section[0]==='products'&&section[1]==='merchandising';const id=orderCreate?'orders':productContent||productMerchandising?'products':emailTemplateId?'emails':section.join('/')||'overview'
 if(emailTemplateId&&!EMAIL_TEMPLATES.some(t=>t.id===emailTemplateId))notFound()
 if(!modules.some(m=>m.id===id))notFound()
 const emailQuery=await searchParams||{};const emailLocale=typeof emailQuery.locale==='string'?emailQuery.locale:'de';const emailVariant=typeof emailQuery.variant==='string'?emailQuery.variant:''
 return <AdminPanel key={[id,emailTemplateId,emailLocale,emailVariant,productContent,orderCreate,productMerchandising].join(":")} section={id} base="/admin" initialEmailTemplateId={emailTemplateId} initialEmailLocale={emailLocale} initialEmailVariant={emailVariant} initialProductContent={productContent} initialOrderCreate={orderCreate} initialProductMerchandising={productMerchandising}/>
}

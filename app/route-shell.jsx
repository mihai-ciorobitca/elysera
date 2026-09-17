'use client'
import dynamic from 'next/dynamic'
import {usePathname} from 'next/navigation'

const StorefrontShell=dynamic(()=>import('./storefront').then(module=>module.Shell))

export default function RouteShell({children}){
 const path=usePathname()
 if(path.startsWith('/dashboard')||path.startsWith('/auth/')||path==='/admin'||path.startsWith('/admin/')||path.startsWith('/admin-preview'))return <>{children}</>
 return <StorefrontShell>{children}</StorefrontShell>
}

'use client'
import {createContext,useContext,useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import {loadPublicCatalog} from '../lib/public-catalog-request.mjs'
import {merchandisingDefaults,validateMerchandising} from '../lib/product-merchandising.mjs'
const MerchandisingContext=createContext(merchandisingDefaults())
export function MerchandisingProvider({children}){const path=usePathname(),[state,setState]=useState(null);useEffect(()=>{let active=true;loadPublicCatalog('/api/product-merchandising').then(b=>{if(active)setState(validateMerchandising(b.products))}).catch(()=>{});return()=>{active=false}},[path]);return <MerchandisingContext.Provider value={state||merchandisingDefaults()}>{children}</MerchandisingContext.Provider>}
export const useMerchandising=()=>useContext(MerchandisingContext)

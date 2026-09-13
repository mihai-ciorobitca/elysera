'use client'
import {createContext,useContext,useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import {merchandisingDefaults,validateMerchandising} from '../lib/product-merchandising.mjs'
const MerchandisingContext=createContext(merchandisingDefaults())
export function MerchandisingProvider({children}){const path=usePathname(),[state,setState]=useState(null);useEffect(()=>{const abort=new AbortController();fetch('/api/product-merchandising',{cache:'no-store',signal:abort.signal}).then(r=>r.ok?r.json():Promise.reject()).then(b=>setState({path,products:validateMerchandising(b.products)})).catch(()=>{});return()=>abort.abort()},[path]);return <MerchandisingContext.Provider value={state?.path===path?state.products:merchandisingDefaults()}>{children}</MerchandisingContext.Provider>}
export const useMerchandising=()=>useContext(MerchandisingContext)

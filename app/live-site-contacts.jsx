import {connection} from 'next/server'
import {prisma} from '../lib/prisma'
import {getSiteSettings} from '../lib/admin/settings-service.mjs'
import PublicContacts from './site-contacts'

export default async function LiveSiteContacts(){
 await connection()
 let settings
 try{settings=await getSiteSettings(prisma)}catch{return null}
 return <PublicContacts settings={settings}/>
}

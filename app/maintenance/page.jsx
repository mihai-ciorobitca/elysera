import {prisma} from '@/lib/prisma'
import {getSiteSettings} from '@/lib/admin/settings-service.mjs'
import MaintenanceMessage from './maintenance-message'
export const dynamic='force-dynamic'
export default async function MaintenancePage(){let settings;try{settings=await getSiteSettings(prisma)}catch{}return <MaintenanceMessage message={settings?.maintenanceMessage}/>}

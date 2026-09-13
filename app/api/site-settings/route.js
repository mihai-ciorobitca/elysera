import {settingsHttp} from '@/lib/admin/settings-http'
export const dynamic='force-dynamic'
export const GET=request=>settingsHttp(request,false)

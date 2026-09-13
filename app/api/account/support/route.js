import {supportHttp} from '@/lib/admin/support-http'
export const dynamic='force-dynamic'
export const maxDuration=30
export const GET=request=>supportHttp(request,false)
export const POST=request=>supportHttp(request,false,true)

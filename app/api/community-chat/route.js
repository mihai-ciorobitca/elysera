import {chatHttp} from '@/lib/chat/http'
export const dynamic='force-dynamic'
export const GET=r=>chatHttp(r,false)
export const POST=r=>chatHttp(r,false,true)

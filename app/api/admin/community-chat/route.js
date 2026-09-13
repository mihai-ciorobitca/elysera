import {chatHttp} from '@/lib/chat/http'
export const dynamic='force-dynamic'
export const GET=r=>chatHttp(r,true)
export const POST=r=>chatHttp(r,true,true)

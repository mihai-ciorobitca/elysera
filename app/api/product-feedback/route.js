import {feedbackHttp} from '@/lib/admin/feedback-http'
export const dynamic='force-dynamic'
export const GET=request=>feedbackHttp(request,false)
export const POST=request=>feedbackHttp(request,false,true)

import {feedbackHttp} from '@/lib/admin/feedback-http'
export const dynamic='force-dynamic'
export const GET=request=>feedbackHttp(request,true)
export const PATCH=request=>feedbackHttp(request,true,true)

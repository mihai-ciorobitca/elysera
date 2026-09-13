import {reviewEvidenceHttp} from '@/lib/review-evidence-http'
export const dynamic='force-dynamic'
export const maxDuration=30
export const runtime='nodejs'
export const GET=request=>reviewEvidenceHttp(request,false)
export const POST=request=>reviewEvidenceHttp(request,false,true)

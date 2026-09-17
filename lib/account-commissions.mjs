import {Prisma} from '@prisma/client'
import {PAID} from './admin/reports-model.mjs'
import {referralRates} from './partner-plan.mjs'

export async function accountCommissions(db,userId){
 return db.$queryRaw`
 SELECT c.id,c."orderId",c.amount,
 CASE WHEN c.status::text='PAID' THEN 'PAID' WHEN c.status::text='MISSED' OR NOT public.elysera_commission_eligible(${userId},c."orderId") THEN 'MISSED' ELSE c.status::text END AS status,
 c."createdAt",c."holdUntil"
 FROM public."Commission" c WHERE c."userId"=${userId} AND public.elysera_only_order(c."orderId")
 UNION ALL
 SELECT 'missed-'||o.id AS id,o.id AS "orderId",
 ROUND(GREATEST(0,(SELECT COALESCE(sum(i.price::numeric*i.quantity),0) FROM public."OrderItem" i WHERE i."orderId"=o.id AND NOT COALESCE(i."is-bonus",false))-COALESCE(o."coupon-eur",0)::numeric-COALESCE(o."nonCommissionableCreditsApplied",0)::numeric)*${referralRates[0]}::numeric/100,2)::double precision AS amount,
 'MISSED' AS status,o."paidAt" AS "createdAt",NULL::timestamptz AS "holdUntil"
 FROM public."Order" o JOIN public."ElyseraPartnerProfile" p ON p."userId"=o."userId"
 WHERE p."parentUserId"=${userId} AND p."userId"<>${userId} AND o.status::text IN (${Prisma.join(PAID)}) AND o."paidAt" IS NOT NULL
 AND public.elysera_only_order(o.id) AND NOT public.elysera_commission_eligible(${userId},o.id)
 AND NOT EXISTS(SELECT 1 FROM public."Commission" c WHERE c."userId"=${userId} AND c."orderId"=o.id)
 ORDER BY "createdAt" DESC,id LIMIT 200`
}

export async function commissionQualification(db,userId){
 const [row]=await db.$queryRaw`SELECT public.elysera_set_paid_at(${userId}) AS "setPaidAt"`
 return {qualified:!!row?.setPaidAt,setPaidAt:row?.setPaidAt||null}
}

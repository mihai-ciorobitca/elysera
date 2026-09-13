-- Admin definitions only; checkout redemption is intentionally not connected.
CREATE TABLE IF NOT EXISTS public."ElyseraCoupon" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "code" text NOT NULL UNIQUE CHECK ("code" ~ '^[A-Z0-9][A-Z0-9_-]{2,39}$'),
 "data" jsonb NOT NULL CHECK (jsonb_typeof("data")='object') CHECK (("data"->>'code') IS NOT DISTINCT FROM "code"),
 "assignedUserId" text REFERENCES public."ElyseraAccountProfile"("userId") ON DELETE RESTRICT,
 "version" integer NOT NULL DEFAULT 1 CHECK ("version">0),
 "createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now(),
 CHECK (("data"->>'assignedUserId') IS NOT DISTINCT FROM "assignedUserId"),
 CHECK ("data"->>'rewardType' IN ('DISCOUNT','FIXED_DISCOUNT','FREE_PRODUCT')),
 CHECK ("data"->>'rewardType'<>'FREE_PRODUCT' OR "data"->>'bonusProductId' IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml'))
);
CREATE TABLE IF NOT EXISTS public."ElyseraCouponAudit" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "couponId" text NOT NULL REFERENCES public."ElyseraCoupon"("id") ON DELETE RESTRICT,
 "actorId" text NOT NULL,"idempotencyKey" text UNIQUE NOT NULL,
 "request" jsonb NOT NULL,"before" jsonb,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ElyseraCouponAudit_coupon" ON public."ElyseraCouponAudit"("couponId","createdAt" DESC);
ALTER TABLE public."ElyseraCoupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraCouponAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraCoupon",public."ElyseraCouponAudit" FROM anon,authenticated;

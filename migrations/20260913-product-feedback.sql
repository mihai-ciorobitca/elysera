CREATE TABLE IF NOT EXISTS public."ElyseraProductFeedback" (
 "id" text PRIMARY KEY,"productId" text NOT NULL CHECK ("productId" IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml')),
 "userId" text NOT NULL REFERENCES public."ElyseraAccountProfile"("userId"),"kind" text NOT NULL CHECK("kind" IN ('question','review')),
 "body" text NOT NULL CHECK(length("body") BETWEEN 5 AND 4000),"rating" integer,"status" text NOT NULL,"reply" text NOT NULL DEFAULT '',"verifiedPurchase" boolean NOT NULL DEFAULT false,
 "version" integer NOT NULL DEFAULT 1 CHECK("version">0),"createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now(),
 CHECK(("kind"='question' AND "status" IN ('OPEN','ANSWERED','HIDDEN') AND "rating" IS NULL) OR ("kind"='review' AND "status" IN ('PENDING','APPROVED','REJECTED') AND "rating" IS NOT NULL AND "rating" BETWEEN 1 AND 5)), CHECK(length("reply")<=8000), CHECK("status" <> 'ANSWERED' OR length(trim("reply"))>0)
);
CREATE INDEX IF NOT EXISTS "ElyseraProductFeedback_product_created_idx" ON public."ElyseraProductFeedback"("productId","createdAt" DESC);
CREATE TABLE IF NOT EXISTS public."ElyseraFeedbackAudit"("id" bigserial PRIMARY KEY,"feedbackId" text NOT NULL REFERENCES public."ElyseraProductFeedback"("id"),"actorId" text NOT NULL,"requestId" text NOT NULL,"payload" jsonb NOT NULL,"before" jsonb,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now(),UNIQUE("actorId","requestId"));
ALTER TABLE public."ElyseraProductFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraFeedbackAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraProductFeedback",public."ElyseraFeedbackAudit" FROM anon, authenticated;

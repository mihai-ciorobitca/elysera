BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraProductContent" (
 "productId" TEXT PRIMARY KEY REFERENCES public."Products"("id"),
 "version" INTEGER NOT NULL DEFAULT 1 CHECK("version">0),"content" JSONB NOT NULL,
 "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK("productId" IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml'))
);
CREATE TABLE IF NOT EXISTS public."ElyseraProductContentAudit" (
 "id" BIGSERIAL PRIMARY KEY,"productId" TEXT NOT NULL REFERENCES public."Products"("id"),
 "actorId" TEXT NOT NULL,"requestId" TEXT NOT NULL,"request" JSONB NOT NULL,
 "before" JSONB NOT NULL,"after" JSONB NOT NULL,"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE("actorId","requestId")
);
ALTER TABLE public."ElyseraProductContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraProductContentAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraProductContent",public."ElyseraProductContentAudit" FROM anon,authenticated;
COMMIT;

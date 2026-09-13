-- Review only: no financial amounts are seeded; current estimates, never historical COGS.
BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraFinanceConfig" (
 "id" text PRIMARY KEY CHECK("id"='current'), "costs" jsonb NOT NULL,
 "version" integer NOT NULL DEFAULT 1 CHECK("version">0), "updatedAt" timestamptz NOT NULL DEFAULT now(),
 CHECK(jsonb_typeof("costs")='object'),
 CHECK("costs" ?& ARRAY['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']),
 CHECK(("costs" - ARRAY['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml'])='{}'::jsonb)
);
CREATE TABLE IF NOT EXISTS public."ElyseraFinanceAudit" (
 "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,"actorId" text NOT NULL,
 "before" jsonb,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public."ElyseraFinanceConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraFinanceAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraFinanceConfig",public."ElyseraFinanceAudit" FROM anon,authenticated;
COMMIT;

-- ELYSERA product audit, public schema.
CREATE TABLE IF NOT EXISTS public."ElyseraProductAudit" (
 "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 "createdAt" timestamptz NOT NULL DEFAULT now(),
 "actorId" text NOT NULL,
 "productId" text NOT NULL CHECK ("productId" IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml')),
 "before" jsonb NOT NULL,
 "after" jsonb NOT NULL
);
ALTER TABLE public."ElyseraProductAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."ElyseraProductAudit" FROM anon, authenticated;

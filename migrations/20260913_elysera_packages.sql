-- Admin configuration only. No storefront/checkout integration and no seeded records.
CREATE TABLE IF NOT EXISTS public."ElyseraPackage" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "slug" text NOT NULL UNIQUE CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 "data" jsonb NOT NULL CHECK (jsonb_typeof("data")='object') CHECK (("data"->>'slug') IS NOT DISTINCT FROM "slug"),
 "version" integer NOT NULL DEFAULT 1 CHECK ("version">0),
 "createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now(),
 CHECK (jsonb_typeof("data"->'items')='array' AND jsonb_array_length("data"->'items') BETWEEN 1 AND 3),
 CHECK (NOT jsonb_path_exists("data", '$.items[*] ? (@.productId != "elysera-renewal-serum-30ml" && @.productId != "elysera-balance-toner-100ml" && @.productId != "elysera-contour-eye-cream-15ml")'))
);
CREATE TABLE IF NOT EXISTS public."ElyseraPackageAudit" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "packageId" text NOT NULL REFERENCES public."ElyseraPackage"("id") ON DELETE RESTRICT,
 "actorId" text NOT NULL,"idempotencyKey" text UNIQUE NOT NULL,
 "request" jsonb NOT NULL,"before" jsonb,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ElyseraPackageAudit_package" ON public."ElyseraPackageAudit"("packageId","createdAt" DESC);
ALTER TABLE public."ElyseraPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraPackageAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraPackage",public."ElyseraPackageAudit" FROM anon,authenticated;

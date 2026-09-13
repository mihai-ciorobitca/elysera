-- Review only. No shared referral import, no seeds and no production application.
-- Read-only admin viewer consumes explicitly configured ELYSERA relationships.
CREATE TABLE IF NOT EXISTS public."ElyseraPartnerProfile" (
 "userId" TEXT PRIMARY KEY REFERENCES public."ElyseraAccountProfile"("userId") ON DELETE CASCADE,
 "parentUserId" TEXT REFERENCES public."ElyseraAccountProfile"("userId") ON DELETE RESTRICT,
 "status" TEXT NOT NULL CHECK ("status" IN ('active','paused')),
 "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0),
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK ("parentUserId" IS NULL OR "parentUserId"<>"userId")
);
ALTER TABLE public."ElyseraPartnerProfile" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraPartnerProfile" FROM anon,authenticated;
-- No INSERT/PATCH endpoint is provided. A separately reviewed enrollment workflow
-- must serialize graph updates, reject cycles, check version, and audit atomically.

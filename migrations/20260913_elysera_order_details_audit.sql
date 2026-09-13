BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraOrderDetailsAudit" (
 "id" BIGSERIAL PRIMARY KEY,"orderId" TEXT NOT NULL REFERENCES public."Order"("id"),
 "actorId" TEXT NOT NULL,"requestId" TEXT NOT NULL,"request" JSONB NOT NULL,
 "before" JSONB NOT NULL,"after" JSONB NOT NULL,"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE("actorId","requestId")
);
ALTER TABLE public."ElyseraOrderDetailsAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraOrderDetailsAudit" FROM anon,authenticated;
COMMIT;

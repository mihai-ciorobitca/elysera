CREATE TABLE IF NOT EXISTS public."ElyseraOrderCreateAudit" (
 "id" TEXT PRIMARY KEY,
 "actorId" TEXT NOT NULL,
 "requestId" TEXT NOT NULL,
 "orderId" TEXT NOT NULL UNIQUE REFERENCES public."Order"("id") ON DELETE RESTRICT,
 "customerId" TEXT NOT NULL REFERENCES public."ElyseraAccountProfile"("userId") ON DELETE RESTRICT,
 "request" JSONB NOT NULL,
 "after" JSONB NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE ("actorId","requestId")
);
ALTER TABLE public."ElyseraOrderCreateAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraOrderCreateAudit" FROM anon,authenticated;

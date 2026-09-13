BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraOrderOperations" (
 "orderId" TEXT PRIMARY KEY REFERENCES public."Order"("id"),
 "version" INTEGER NOT NULL DEFAULT 1 CHECK("version">0),
 "trackingNumber" TEXT NOT NULL DEFAULT '' CHECK(length("trackingNumber")<=150),
 "trackingCarrier" TEXT NOT NULL DEFAULT '' CHECK(length("trackingCarrier")<=100),
 "note" TEXT NOT NULL DEFAULT '' CHECK(length("note")<=2000),
 "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ElyseraOrderAudit" (
 "id" BIGSERIAL PRIMARY KEY,"orderId" TEXT NOT NULL REFERENCES public."Order"("id"),
 "actorId" TEXT NOT NULL,"requestId" TEXT NOT NULL,"request" JSONB NOT NULL,
 "before" JSONB NOT NULL,"after" JSONB NOT NULL,"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE("actorId","requestId")
);
ALTER TABLE public."ElyseraOrderOperations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraOrderAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraOrderOperations",public."ElyseraOrderAudit" FROM anon,authenticated;
COMMIT;

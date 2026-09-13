CREATE TABLE IF NOT EXISTS public."ElyseraCustomerAudit" (
 "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 "createdAt" timestamptz NOT NULL DEFAULT now(),
 "actorId" text NOT NULL,
 "customerId" text NOT NULL,
 "before" jsonb NOT NULL,
 "after" jsonb NOT NULL
);
ALTER TABLE public."ElyseraCustomerAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."ElyseraCustomerAudit" FROM anon, authenticated;

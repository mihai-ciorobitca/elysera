-- ELYSERA only. Deliberately no import of shared User credits/CreditTransaction.
CREATE TABLE IF NOT EXISTS public."ElyseraCreditLedger" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "userId" text NOT NULL REFERENCES public."ElyseraAccountProfile"("userId") ON DELETE RESTRICT,
 "amountCents" integer NOT NULL CHECK ("amountCents">0 AND "amountCents"<=10000000),
 "type" text NOT NULL DEFAULT 'ADMIN_GRANT' CHECK ("type"='ADMIN_GRANT'),
 "commissionable" boolean NOT NULL DEFAULT false CHECK (NOT "commissionable"),
 "reason" text NOT NULL CHECK (char_length(trim("reason")) BETWEEN 3 AND 240),
 "actorId" text NOT NULL,"actorEmail" text NOT NULL,"recipientEmail" text NOT NULL,
 "idempotencyKey" text UNIQUE NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ElyseraCreditLedger_user_created" ON public."ElyseraCreditLedger" ("userId","createdAt" DESC);
CREATE TABLE IF NOT EXISTS public."ElyseraCreditAudit" (
 "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "ledgerId" text UNIQUE NOT NULL REFERENCES public."ElyseraCreditLedger"("id") ON DELETE RESTRICT,
 "actorId" text NOT NULL,"payload" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public."ElyseraCreditLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraCreditAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraCreditLedger",public."ElyseraCreditAudit" FROM anon,authenticated;

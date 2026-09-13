BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraFaqEntry" (
 "id" text PRIMARY KEY,"question" text NOT NULL,"answer" text NOT NULL DEFAULT '',
 "locale" text NOT NULL DEFAULT 'de' CHECK (length("locale") <= 12 AND "locale" ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$'),
 "status" text NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','APPROVED','REJECTED')),
 "sortOrder" integer NOT NULL DEFAULT 0,"version" integer NOT NULL DEFAULT 1,
 "createdAt" timestamptz NOT NULL DEFAULT now(),"updatedAt" timestamptz NOT NULL DEFAULT now(),"reviewedAt" timestamptz,
 CHECK (length(trim("question")) BETWEEN 1 AND 2000),CHECK (length("answer")<=6000),CHECK ("status"<>'APPROVED' OR length(trim("answer"))>0)
);
CREATE TABLE IF NOT EXISTS public."ElyseraFaqAudit" (
 "id" bigserial PRIMARY KEY,"actorId" text NOT NULL,"faqId" text NOT NULL REFERENCES public."ElyseraFaqEntry"("id"),
 "before" jsonb,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public."ElyseraFaqEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraFaqAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraFaqEntry",public."ElyseraFaqAudit" FROM anon,authenticated;
COMMIT;

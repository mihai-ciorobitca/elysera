BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraReviewEvidence" (
 "id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL REFERENCES public."ElyseraAccountProfile"("userId"),
 "orderId" TEXT NOT NULL UNIQUE REFERENCES public."Order"("id"),
 "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK("status" IN ('PENDING','APPROVED','REJECTED')),
 "version" INTEGER NOT NULL DEFAULT 1 CHECK("version">0),
 "evidencePath" TEXT NOT NULL,"evidenceSha" TEXT NOT NULL,"evidenceBytes" INTEGER NOT NULL,
 "confirmedOwnWords" BOOLEAN NOT NULL CHECK("confirmedOwnWords"),
 "rejectionReason" TEXT,"submittedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "reviewedAt" TIMESTAMPTZ,"reviewedBy" TEXT,"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "ElyseraReviewEvidence_one_pending" ON public."ElyseraReviewEvidence"("userId") WHERE "status"='PENDING';
CREATE TABLE IF NOT EXISTS public."ElyseraReviewEvidenceAttempt" (
 "id" TEXT PRIMARY KEY,"submissionId" TEXT NOT NULL REFERENCES public."ElyseraReviewEvidence"("id"),
 "version" INTEGER NOT NULL,"evidencePath" TEXT NOT NULL UNIQUE,"evidenceSha" TEXT NOT NULL,
 "evidenceBytes" INTEGER NOT NULL,"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ElyseraReviewEvidenceAudit" (
 "id" BIGSERIAL PRIMARY KEY,"submissionId" TEXT NOT NULL REFERENCES public."ElyseraReviewEvidence"("id"),
 "actorId" TEXT NOT NULL,"requestId" TEXT NOT NULL,"action" TEXT NOT NULL,
 "request" JSONB NOT NULL,"before" JSONB,"after" JSONB NOT NULL,"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE("actorId","requestId")
);
ALTER TABLE public."ElyseraReviewEvidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraReviewEvidenceAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraReviewEvidenceAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraReviewEvidence",public."ElyseraReviewEvidenceAttempt",public."ElyseraReviewEvidenceAudit" FROM anon,authenticated;
COMMIT;

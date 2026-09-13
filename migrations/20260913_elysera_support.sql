BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraSupportTicket" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES public."ElyseraAccountProfile"("userId"),
 "subject" TEXT NOT NULL CHECK(length("subject") BETWEEN 1 AND 200),
 "status" TEXT NOT NULL DEFAULT 'open' CHECK("status" IN ('open','in_progress','resolved','closed')),
 "version" INTEGER NOT NULL DEFAULT 1 CHECK("version">0), "archivedAt" TIMESTAMPTZ,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ElyseraSupportMessage" (
 "id" TEXT PRIMARY KEY, "ticketId" TEXT NOT NULL REFERENCES public."ElyseraSupportTicket"("id"),
 "actorId" TEXT NOT NULL, "sender" TEXT NOT NULL CHECK("sender" IN ('user','staff')),
 "body" TEXT NOT NULL CHECK(length("body") BETWEEN 1 AND 10000), "requestId" TEXT NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE("actorId","requestId")
);
CREATE TABLE IF NOT EXISTS public."ElyseraSupportAudit" (
 "id" BIGSERIAL PRIMARY KEY, "ticketId" TEXT NOT NULL REFERENCES public."ElyseraSupportTicket"("id"),
 "actorId" TEXT NOT NULL, "action" TEXT NOT NULL, "before" JSONB, "after" JSONB NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ElyseraSupportTicket_user_updated" ON public."ElyseraSupportTicket"("userId","updatedAt" DESC);
CREATE INDEX IF NOT EXISTS "ElyseraSupportMessage_ticket" ON public."ElyseraSupportMessage"("ticketId","createdAt");
ALTER TABLE public."ElyseraSupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraSupportMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraSupportAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraSupportTicket",public."ElyseraSupportMessage",public."ElyseraSupportAudit" FROM anon,authenticated;
COMMIT;

BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraProductRevision"("productId" text PRIMARY KEY,"version" integer NOT NULL DEFAULT 0 CHECK("version">=0));
CREATE TABLE IF NOT EXISTS public."ElyseraProductRequest"("id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,"actorId" text NOT NULL,"productId" text NOT NULL,"requestId" text NOT NULL,"payload" jsonb NOT NULL,"before" jsonb NOT NULL,"after" jsonb NOT NULL,"createdAt" timestamptz NOT NULL DEFAULT now(),UNIQUE("actorId","requestId"));
ALTER TABLE public."ElyseraProductRevision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraProductRequest" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraProductRevision",public."ElyseraProductRequest" FROM anon,authenticated;
COMMIT;

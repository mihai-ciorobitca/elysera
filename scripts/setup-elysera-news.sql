-- Additive migration only. Never run prisma db push against the shared schema.
CREATE TABLE IF NOT EXISTS public."ElyseraNews" (
 "id" uuid PRIMARY KEY, "slug" text NOT NULL UNIQUE,
 "title" text NOT NULL, "excerpt" text NOT NULL DEFAULT '', "body" text NOT NULL DEFAULT '',
 "image" text NOT NULL DEFAULT '', "imageAlt" text NOT NULL DEFAULT '',
 "seoTitle" text NOT NULL DEFAULT '', "seoDescription" text NOT NULL DEFAULT '',
 "status" text NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','PUBLISHED','ARCHIVED')),
 "version" integer NOT NULL DEFAULT 1, "authorId" text NOT NULL,
 "lastRequestId" uuid NOT NULL, "lastRequest" jsonb NOT NULL,
 "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), "publishedAt" timestamptz
);
CREATE INDEX IF NOT EXISTS "ElyseraNews_public_idx" ON public."ElyseraNews" ("publishedAt" DESC) WHERE "status"='PUBLISHED';
ALTER TABLE public."ElyseraNews" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraNews" FROM anon, authenticated;

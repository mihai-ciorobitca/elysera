BEGIN;
CREATE TABLE IF NOT EXISTS public."ElyseraSiteSettings" (
 "id" text PRIMARY KEY CHECK ("id"='current'), "version" integer NOT NULL DEFAULT 0 CHECK ("version">=0),
 "settings" jsonb NOT NULL, "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ElyseraSiteSettingsAudit" (
 "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "actorId" text NOT NULL, "requestId" text NOT NULL,
 "payload" jsonb NOT NULL, "before" jsonb NOT NULL, "after" jsonb NOT NULL,
 "createdAt" timestamptz NOT NULL DEFAULT now(), UNIQUE ("actorId","requestId")
);
ALTER TABLE public."ElyseraSiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraSiteSettingsAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraSiteSettings",public."ElyseraSiteSettingsAudit" FROM anon,authenticated;
INSERT INTO public."ElyseraSiteSettings"("id","settings") VALUES ('current','{"supportEmail":"","supportPhone":"","whatsapp":"","instagram":"","facebook":"","youtube":"","tiktok":"","linkedin":"","x":"","maintenance":false,"maintenanceMessage":""}'::jsonb) ON CONFLICT ("id") DO NOTHING;
COMMIT;

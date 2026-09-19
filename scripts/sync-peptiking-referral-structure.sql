-- User-authorized ongoing parity with PeptiKing. Deploy registration's
-- ON CONFLICT compatibility change before installing this trigger.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='60s';
SELECT pg_advisory_xact_lock(7042601917082026::bigint);
LOCK TABLE public."User" IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public."ElyseraAccountProfile",public."ElyseraPartnerProfile" IN SHARE ROW EXCLUSIVE MODE;
DO $validate$
BEGIN
 IF (WITH RECURSIVE tree AS (
  SELECT id FROM public."User" WHERE "referredById" IS NULL
  UNION SELECT u.id FROM public."User" u JOIN tree t ON u."referredById"=t.id
 ) SELECT count(*) FROM tree) <> (SELECT count(*) FROM public."User")
 THEN RAISE EXCEPTION 'Invalid PeptiKing referral graph'; END IF;
END $validate$;
INSERT INTO public."ElyseraAccountProfile" ("userId")
SELECT id FROM public."User" ON CONFLICT ("userId") DO NOTHING;
INSERT INTO public."ElyseraPartnerProfile" ("userId","parentUserId","status","createdAt")
SELECT id,"referredById",CASE WHEN blocked THEN 'paused' ELSE 'active' END,"createdAt" AT TIME ZONE 'UTC'
FROM public."User" ON CONFLICT ("userId") DO UPDATE
SET "parentUserId"=EXCLUDED."parentUserId","version"="ElyseraPartnerProfile"."version"+1,"updatedAt"=now()
WHERE "ElyseraPartnerProfile"."parentUserId" IS DISTINCT FROM EXCLUDED."parentUserId";

CREATE OR REPLACE FUNCTION public.elysera_sync_referral_structure()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $sync$
BEGIN
 PERFORM pg_advisory_xact_lock(7042601917082026::bigint);
 IF NEW."referredById" IS NOT NULL THEN
  IF EXISTS (WITH RECURSIVE ancestors AS (
   SELECT id,"referredById" FROM public."User" WHERE id=NEW."referredById"
   UNION SELECT u.id,u."referredById" FROM public."User" u JOIN ancestors a ON u.id=a."referredById"
  ) SELECT 1 FROM ancestors WHERE id=NEW.id)
  THEN RAISE EXCEPTION 'Referral cycle rejected'; END IF;
 END IF;
 INSERT INTO public."ElyseraAccountProfile" ("userId") VALUES (NEW.id) ON CONFLICT ("userId") DO NOTHING;
 INSERT INTO public."ElyseraPartnerProfile" ("userId","parentUserId","status","createdAt")
 VALUES (NEW.id,NEW."referredById",CASE WHEN NEW.blocked THEN 'paused' ELSE 'active' END,NEW."createdAt" AT TIME ZONE 'UTC')
 ON CONFLICT ("userId") DO UPDATE SET "parentUserId"=EXCLUDED."parentUserId",
 "version"="ElyseraPartnerProfile"."version"+1,"updatedAt"=now()
 WHERE "ElyseraPartnerProfile"."parentUserId" IS DISTINCT FROM EXCLUDED."parentUserId";
 RETURN NEW;
END $sync$;
REVOKE ALL ON FUNCTION public.elysera_sync_referral_structure() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER elysera_sync_referral_structure
AFTER INSERT OR UPDATE OF "referredById" ON public."User"
FOR EACH ROW EXECUTE FUNCTION public.elysera_sync_referral_structure();
COMMIT;

-- Authorized one-time referral import. No financial tables or financial fields are read or written.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(7042601917082026::bigint);
LOCK TABLE public."User" IN SHARE MODE;
LOCK TABLE public."ElyseraAccountProfile", public."ElyseraPartnerProfile" IN SHARE ROW EXCLUSIVE MODE;
DO $import$
DECLARE source_count bigint; reachable_count bigint;
BEGIN
 SELECT count(*) INTO source_count FROM public."User";
 WITH RECURSIVE tree AS (
  SELECT id FROM public."User" WHERE "referredById" IS NULL
  UNION ALL SELECT u.id FROM public."User" u JOIN tree t ON u."referredById"=t.id
 ) SELECT count(*) INTO reachable_count FROM tree;
 IF source_count <> reachable_count THEN RAISE EXCEPTION 'Source has missing parents or cycles; import aborted'; END IF;
 INSERT INTO public."ElyseraAccountProfile" ("userId")
 SELECT id FROM public."User" ON CONFLICT ("userId") DO NOTHING;
 INSERT INTO public."ElyseraPartnerProfile" ("userId","parentUserId","status","createdAt")
 SELECT id,"referredById",CASE WHEN blocked THEN 'paused' ELSE 'active' END,"createdAt" AT TIME ZONE 'UTC'
 FROM public."User"
 ON CONFLICT ("userId") DO UPDATE SET
 "parentUserId"=EXCLUDED."parentUserId",
 "version"="ElyseraPartnerProfile"."version"+1,"updatedAt"=now()
 WHERE "ElyseraPartnerProfile"."parentUserId" IS DISTINCT FROM EXCLUDED."parentUserId";
 IF EXISTS (
  SELECT 1 FROM public."User" u LEFT JOIN public."ElyseraPartnerProfile" p ON p."userId"=u.id
  WHERE p."userId" IS NULL OR p."parentUserId" IS DISTINCT FROM u."referredById"
 ) THEN RAISE EXCEPTION 'Referral parity check failed'; END IF;
END $import$;
COMMIT;
SELECT count(*) AS profiles,
 count(*) FILTER (WHERE p."parentUserId" IS NOT NULL) AS referral_links,
 count(*) FILTER (WHERE p."parentUserId" IS DISTINCT FROM u."referredById") AS mismatches
FROM public."ElyseraPartnerProfile" p JOIN public."User" u ON u.id=p."userId";


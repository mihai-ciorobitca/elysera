-- Add accounts missed after the initial import, without reparenting existing
-- ELYSERA members or touching credentials, orders, commissions or balances.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(7042601917082026::bigint);
LOCK TABLE public."User" IN SHARE MODE;
LOCK TABLE public."ElyseraAccountProfile", public."ElyseraPartnerProfile" IN SHARE ROW EXCLUSIVE MODE;
DO $backfill$
BEGIN
 IF EXISTS (
  SELECT 1 FROM public."User" u LEFT JOIN public."User" parent ON parent.id=u."referredById"
  WHERE u."referredById" IS NOT NULL AND parent.id IS NULL
 ) THEN RAISE EXCEPTION 'Missing source parent; backfill aborted'; END IF;
 INSERT INTO public."ElyseraAccountProfile" ("userId")
 SELECT id FROM public."User" ON CONFLICT ("userId") DO NOTHING;
 INSERT INTO public."ElyseraPartnerProfile" ("userId","parentUserId","status","createdAt")
 SELECT id,"referredById",CASE WHEN blocked THEN 'paused' ELSE 'active' END,"createdAt" AT TIME ZONE 'UTC'
 FROM public."User" ON CONFLICT ("userId") DO NOTHING;
 -- Validate the resulting ELYSERA graph, including preserved existing parents.
 IF (WITH RECURSIVE tree AS (
  SELECT "userId" FROM public."ElyseraPartnerProfile" WHERE "parentUserId" IS NULL
  UNION
  SELECT p."userId" FROM public."ElyseraPartnerProfile" p JOIN tree t ON p."parentUserId"=t."userId"
 ) SELECT count(*) FROM tree) <> (SELECT count(*) FROM public."ElyseraPartnerProfile")
 THEN RAISE EXCEPTION 'Unreachable or cyclic ELYSERA graph; backfill aborted'; END IF;
END $backfill$;
COMMIT;

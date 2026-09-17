-- Repeatable contact repair and missing-account reconciliation.
-- Existing ELYSERA addresses and partner links win; shared source rows are read only.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(7042601917082026::bigint);
LOCK TABLE public."User" IN SHARE MODE;
LOCK TABLE public."ElyseraAccountProfile", public."ElyseraPartnerProfile" IN SHARE ROW EXCLUSIVE MODE;

INSERT INTO public."ElyseraAccountProfile" ("userId")
SELECT id FROM public."User" ON CONFLICT ("userId") DO NOTHING;

INSERT INTO public."ElyseraPartnerProfile" ("userId","parentUserId",status,"createdAt")
SELECT id,"referredById",CASE WHEN blocked THEN 'paused' ELSE 'active' END,
  "createdAt" AT TIME ZONE 'UTC'
FROM public."User"
ON CONFLICT ("userId") DO NOTHING;

WITH source AS (
 SELECT u.id,
   COALESCE(NULLIF(btrim(u.phone),''), CASE WHEN NULLIF(btrim(u."phoneNational"),'') IS NOT NULL
     THEN concat(NULLIF(btrim(u."phoneDialCode"),''), btrim(u."phoneNational")) END) AS phone,
   btrim(a."address1") AS address1,a."postalCode",a.city,a.country,
   regexp_match(btrim(a."address1"), '^(.+[^0-9])[[:space:]]+([0-9]+[[:space:]]*[[:alpha:]]?([[:space:]]*[-/][[:space:]]*[0-9]+[[:space:]]*[[:alpha:]]?)?)$') AS parts
 FROM public."User" u
 LEFT JOIN LATERAL (
   SELECT "address1","postalCode",city,country FROM public."UserAddress"
   WHERE "userId"=u.id AND status='APPROVED'
   ORDER BY "updatedAt" DESC,id DESC LIMIT 1
 ) a ON true
), patches AS (
 SELECT p."userId",
   (CASE WHEN NULLIF(btrim(p.details->>'phone'),'') IS NULL AND s.phone IS NOT NULL
      THEN jsonb_build_object('phone',s.phone) ELSE '{}'::jsonb END)
   ||
   (CASE WHEN NOT EXISTS (
       SELECT 1 FROM unnest(ARRAY['street','houseNumber','postalCode','city','country']) k
       WHERE NULLIF(btrim(p.details->>k),'') IS NOT NULL)
     AND NULLIF(s.address1,'') IS NOT NULL
     THEN jsonb_strip_nulls(jsonb_build_object(
       'street',COALESCE(btrim(s.parts[1]),s.address1),
       'houseNumber',btrim(s.parts[2]),
       'postalCode',NULLIF(btrim(s."postalCode"),''),
       'city',NULLIF(btrim(s.city),''),
       'country',NULLIF(btrim(s.country),'')
     )) ELSE '{}'::jsonb END) AS patch
 FROM public."ElyseraAccountProfile" p JOIN source s ON s.id=p."userId"
)
UPDATE public."ElyseraAccountProfile" p
SET details=p.details||x.patch,"updatedAt"=NOW()
FROM patches x WHERE x."userId"=p."userId" AND x.patch<>'{}'::jsonb;
DO $verify$
BEGIN
 IF EXISTS(SELECT 1 FROM public."User" u
   LEFT JOIN public."ElyseraAccountProfile" p ON p."userId"=u.id
   LEFT JOIN public."ElyseraPartnerProfile" r ON r."userId"=u.id
   WHERE p."userId" IS NULL OR r."userId" IS NULL)
 THEN RAISE EXCEPTION 'Missing profiles after reconciliation'; END IF;
END $verify$;
COMMIT;


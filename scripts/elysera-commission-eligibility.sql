-- Scoped ELYSERA guard. No other catalog's commissions or balances are changed.
CREATE OR REPLACE FUNCTION public.elysera_only_order(order_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=order_id)
 AND NOT EXISTS(SELECT 1 FROM public."OrderItem" i WHERE i."orderId"=order_id AND
 (i."productId" IS NULL OR i."productId" NOT IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml')))
$$;

CREATE OR REPLACE FUNCTION public.elysera_set_paid_at(member_id text) RETURNS timestamp
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT min(o."paidAt") FROM public."Order" o
 JOIN public."ElyseraOrderCreateAudit" a ON a."orderId"=o.id AND a."customerId"=o."userId"
 WHERE o."userId"=member_id AND o.status::text IN ('PAID','PACKED','SHIPPED','DELIVERED')
 AND o."paidAt" IS NOT NULL AND o.total-COALESCE(o."coupon-eur",0)>0
 AND public.elysera_only_order(o.id)
 AND a."after"->'package'->>'id' IS NOT NULL
 AND jsonb_array_length(COALESCE(a."after"->'package'->'items','[]'::jsonb))>0
 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(a."after"->'package'->'items') item
 WHERE COALESCE((SELECT sum(i.quantity) FROM public."OrderItem" i WHERE i."orderId"=o.id AND i."productId"=item->>'productId' AND NOT COALESCE(i."is-bonus",false)),0)<(item->>'quantity')::integer)
$$;

CREATE OR REPLACE FUNCTION public.elysera_commission_eligible(member_id text,sale_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 SELECT COALESCE((SELECT o.status::text IN ('PAID','PACKED','SHIPPED','DELIVERED')
 AND public.elysera_only_order(o.id) AND public.elysera_set_paid_at(member_id)<o."paidAt"
 FROM public."Order" o WHERE o.id=sale_id),false)
$$;

CREATE OR REPLACE FUNCTION public.elysera_guard_commission() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 IF TG_OP='UPDATE' AND public.elysera_only_order(OLD."orderId") THEN
  IF NEW."orderId" IS DISTINCT FROM OLD."orderId" OR NEW."userId" IS DISTINCT FROM OLD."userId" THEN
   RAISE EXCEPTION 'ELYSERA commission identity cannot be changed';
  END IF;
 END IF;
 IF NOT public.elysera_only_order(NEW."orderId") THEN RETURN NEW; END IF;
 IF NOT public.elysera_commission_eligible(NEW."userId",NEW."orderId")
 OR (TG_OP='UPDATE' AND OLD.status::text='MISSED') THEN
  IF NEW.status::text IN ('REQUESTED','APPROVED','PAID') OR COALESCE(NEW."convertedToCredits",false) THEN
   RAISE EXCEPTION 'ELYSERA: no paid set before referred purchase; commission is lost';
  END IF;
  NEW.status:='MISSED';
  NEW."convertedToCredits":=false;
 END IF;
 RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.elysera_only_order(text),public.elysera_set_paid_at(text),public.elysera_commission_eligible(text,text),public.elysera_guard_commission() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.elysera_only_order(text),public.elysera_set_paid_at(text),public.elysera_commission_eligible(text,text),public.elysera_guard_commission() TO service_role;
DROP TRIGGER IF EXISTS elysera_commission_eligibility ON public."Commission";
CREATE TRIGGER elysera_commission_eligibility BEFORE INSERT OR UPDATE ON public."Commission" FOR EACH ROW EXECUTE FUNCTION public.elysera_guard_commission();

-- LOCAL SYNTHETIC DATABASE ONLY. Run through run-commission-db-check.cjs.
BEGIN;
DO $$
DECLARE
 member_id text; buyer_id text;
 own_id text:=gen_random_uuid()::text; early_id text:=gen_random_uuid()::text; late_id text:=gen_random_uuid()::text;
 lost_id text:=gen_random_uuid()::text; earned_id text:=gen_random_uuid()::text;
 pack jsonb; current_status text;
BEGIN
 SELECT "userId" INTO member_id FROM public."ElyseraAccountProfile" WHERE "userId"='fixture-member' AND public.elysera_set_paid_at("userId") IS NULL;
 SELECT "userId" INTO buyer_id FROM public."ElyseraAccountProfile" WHERE "userId"='fixture-buyer';
 IF member_id IS NULL OR buyer_id IS NULL THEN RAISE EXCEPTION 'Fixture accounts unavailable'; END IF;
 INSERT INTO public."Order"(id,"userId",total,status,"paidAt") VALUES
 (own_id,member_id,139,'PAID','2026-09-17 10:00:00'),(early_id,buyer_id,69,'PAID','2026-09-17 09:00:00'),(late_id,buyer_id,69,'PAID','2026-09-17 11:00:00');
 INSERT INTO public."OrderItem"(id,"orderId","productId",quantity,price)
 SELECT gen_random_uuid()::text,own_id,p,1,40 FROM unnest(ARRAY['elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml']) p;
 INSERT INTO public."OrderItem"(id,"orderId","productId",quantity,price) VALUES
 (gen_random_uuid()::text,early_id,'elysera-renewal-serum-30ml',1,69),(gen_random_uuid()::text,late_id,'elysera-renewal-serum-30ml',1,69);
 IF public.elysera_set_paid_at(member_id) IS NOT NULL THEN RAISE EXCEPTION 'Single-product evidence must not qualify'; END IF;
 INSERT INTO public."Commission"(id,"userId","orderId",amount,level,status) VALUES(lost_id,member_id,early_id,13.8,1,'PENDING');
 SELECT status::text INTO current_status FROM public."Commission" WHERE id=lost_id;
 IF current_status<>'MISSED' THEN RAISE EXCEPTION 'Unqualified commission not lost'; END IF;
 SELECT jsonb_build_object('id','peptide-ritual-set','name','Fixture set','items',jsonb_agg(jsonb_build_object('productId',i."productId",'quantity',1))) INTO pack FROM public."OrderItem" i WHERE i."orderId"=own_id;
 INSERT INTO public."ElyseraOrderCreateAudit"(id,"actorId","requestId","orderId","customerId",request,"after") VALUES(gen_random_uuid()::text,'rollback-test',gen_random_uuid()::text,own_id,member_id,'{}',jsonb_build_object('package',pack));
 IF public.elysera_set_paid_at(member_id) IS NULL THEN RAISE EXCEPTION 'Paid set not recognized'; END IF;
 IF public.elysera_commission_eligible(member_id,early_id) THEN RAISE EXCEPTION 'Earlier purchase wrongly qualified'; END IF;
 IF NOT public.elysera_commission_eligible(member_id,late_id) THEN RAISE EXCEPTION 'Future purchase not qualified'; END IF;
 BEGIN
  UPDATE public."Commission" SET status='PAID' WHERE id=lost_id;
  RAISE EXCEPTION 'TEST: lost payout allowed';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM NOT LIKE 'ELYSERA: no paid set%' THEN RAISE; END IF;
 END;
 BEGIN
  UPDATE public."Commission" SET "convertedToCredits"=true WHERE id=lost_id;
  RAISE EXCEPTION 'TEST: lost credit conversion allowed';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM NOT LIKE 'ELYSERA: no paid set%' THEN RAISE; END IF;
 END;
 INSERT INTO public."Commission"(id,"userId","orderId",amount,level,status) VALUES(earned_id,member_id,late_id,13.8,1,'PENDING');
 SELECT status::text INTO current_status FROM public."Commission" WHERE id=earned_id;
 IF current_status<>'PENDING' THEN RAISE EXCEPTION 'Eligible commission incorrectly lost'; END IF;
 UPDATE public."Order" SET status='CANCELLED' WHERE id=own_id;
 IF public.elysera_commission_eligible(member_id,late_id) THEN RAISE EXCEPTION 'Cancelled set qualifies'; END IF;
 BEGIN
  UPDATE public."Commission" SET status='APPROVED' WHERE id=earned_id;
  RAISE EXCEPTION 'TEST: cancelled set payout allowed';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM NOT LIKE 'ELYSERA: no paid set%' THEN RAISE; END IF;
 END;
END $$;
ROLLBACK;
SELECT 'Commission qualification, lost status, payout and credit guards verified; fixtures rolled back' AS result;

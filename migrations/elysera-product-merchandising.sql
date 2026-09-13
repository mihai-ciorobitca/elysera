CREATE OR REPLACE FUNCTION public.elysera_valid_merchandising(value jsonb) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE item jsonb; ids text[] := ARRAY[]::text[]; positions int[] := ARRAY[]::int[];
BEGIN
 IF jsonb_typeof(value) IS DISTINCT FROM 'array' OR jsonb_array_length(value) <> 3 THEN RETURN false; END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(value) LOOP
  IF jsonb_typeof(item) IS DISTINCT FROM 'object' OR (SELECT count(*) FROM jsonb_object_keys(item))<>4 OR NOT item ?& ARRAY['id','category','showNewBadge','displayOrder'] THEN RETURN false; END IF;
  IF jsonb_typeof(item->'id') IS DISTINCT FROM 'string' OR jsonb_typeof(item->'category') IS DISTINCT FROM 'string' OR item->>'id' NOT IN ('elysera-renewal-serum-30ml','elysera-balance-toner-100ml','elysera-contour-eye-cream-15ml') OR item->>'category' NOT IN ('Toner','Serum','Augenpflege') OR jsonb_typeof(item->'showNewBadge') IS DISTINCT FROM 'boolean' OR jsonb_typeof(item->'displayOrder') IS DISTINCT FROM 'number' OR item->>'displayOrder' NOT IN ('1','2','3') THEN RETURN false; END IF;
  ids:=array_append(ids,item->>'id'); positions:=array_append(positions,(item->>'displayOrder')::int);
 END LOOP;
 RETURN (SELECT count(DISTINCT x)=3 FROM unnest(ids) x) AND (SELECT count(DISTINCT x)=3 FROM unnest(positions) x);
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;
CREATE TABLE IF NOT EXISTS public."ElyseraProductMerchandising" (
 "id" text PRIMARY KEY CHECK ("id"='current'),
 "version" integer NOT NULL DEFAULT 0 CHECK ("version">=0),
 "products" jsonb NOT NULL CHECK (public.elysera_valid_merchandising("products")),
 "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ElyseraProductMerchandisingAudit" (
 "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 "actorId" text NOT NULL,
 "requestId" text NOT NULL,
 "request" jsonb NOT NULL,
 "before" jsonb NOT NULL,
 "after" jsonb NOT NULL,
 "createdAt" timestamptz NOT NULL DEFAULT now(),
 UNIQUE ("actorId","requestId")
);
ALTER TABLE public."ElyseraProductMerchandising" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ElyseraProductMerchandisingAudit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ElyseraProductMerchandising",public."ElyseraProductMerchandisingAudit" FROM anon,authenticated;

-- Server-only activity marker. Existing/shared Supabase logins are deliberately
-- not backdated: they do not prove a visit to ELYSERA.
ALTER TABLE public."ElyseraAccountProfile"
  ADD COLUMN IF NOT EXISTS "firstLoginAt" timestamptz;

-- Supports descendant traversal and direct-referral lookups.
CREATE INDEX IF NOT EXISTS "ElyseraPartnerProfile_parentUserId_idx"
  ON public."ElyseraPartnerProfile" ("parentUserId");

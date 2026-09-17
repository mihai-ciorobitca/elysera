// Called only after provider identity, MFA and business access checks pass.
// The unique profile key and conditional upsert retain exactly one timestamp,
// including concurrent requests. Contact edit versions remain unchanged.
export async function recordFirstLogin(db, userId) {
  await db.$executeRaw`INSERT INTO public."ElyseraAccountProfile" ("userId", "firstLoginAt")
    VALUES (${userId}, NOW())
    ON CONFLICT ("userId") DO UPDATE SET "firstLoginAt" = EXCLUDED."firstLoginAt"
    WHERE "ElyseraAccountProfile"."firstLoginAt" IS NULL`
}

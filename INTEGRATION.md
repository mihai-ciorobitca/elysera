# ELYSERA account integration

ELYSERA uses the existing Supabase Auth identity and the existing public User record. No password copy, legacy hash fallback, account duplication, schema migration, or PeptiKing source changes.

Sign in: /auth/signin. Successful email/password login redirects only to /dashboard. Verified TOTP MFA is enforced when enrolled. ADMIN and STAFF accounts are excluded from this customer portal. Dashboard and account APIs verify the provider identity and business account status server-side.

Cookies are named elysera-auth, host-only, HttpOnly, SameSite=Lax, Secure in production. Logout uses scope local. Other domains retain their own sessions. Shared profile name edits affect the same existing account; email and structured telephone are read-only here.

Set server-only ELYSERA_SUPABASE_URL, ELYSERA_SUPABASE_ANON_KEY, ELYSERA_RATE_LIMIT_SECRET and existing database variables. Local credentials are ignored by Git. Login attempts use namespaced HMAC keys in the existing AiRateLimitBucket table.

Orders and commissions are limited to 200 recent user-owned records whose orders contain exclusively ELYSERA product IDs. Mixed orders are excluded. Personal purchase value is not affiliate revenue. Empty accounts show zero, never invented demonstration figures.

Implemented: registration, email verification and resend, password recovery and authenticated password changes. ELYSERA uses its own Resend templates and namespaced hashed tokens in the existing EmailVerificationToken / PasswordResetToken tables; no shared Supabase email templates are changed. Links expire after 30 minutes and require explicit POST confirmation; GET requests never consume them. A shared password change applies wherever that identity is used.

Not yet configured: a valid ELYSERA Resend key (current key returns 401), verified sender matching ELYSERA_SITE_URL, production domain/deployment, Google OAuth, ELYSERA referral tracking/team membership, checkout and payout initiation. Shared provider branding and emails were not changed. Real-account successful login needs an interactive check by the account holder; never send passwords in chat.

Verification: node --test scripts/auth-policy.test.mjs; npm run build; node scripts/check-elysera-auth.cjs. No production deployment is implied.


Environment: ELYSERA_SUPABASE_SERVICE_ROLE_KEY (server-only, verified read access), ELYSERA_RESEND_API_KEY, ELYSERA_EMAIL_FROM, ELYSERA_SITE_URL. Never put these secrets in NEXT_PUBLIC variables. Production requires an explicit HTTPS site origin. Password changes require current password and existing MFA assurance; recovery changes the password without issuing a session, so subsequent login still enforces MFA.

Validation: 23 isolated browser checks and 8 unit/policy checks passed. No real registration emails were sent and no live user account was changed. E-mail previews are under output/account-emails. Supply the final domain, verified sender, working mail API key through local environment settings, and a user-owned test mailbox to finish real delivery verification.

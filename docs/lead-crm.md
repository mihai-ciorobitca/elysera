# Elysera lead CRM

Routes: `/admin/crm` and `/dashboard/crm`. The existing admin menu, partner dashboard menu, and storefront footer link to the CRM.

## Authentication

The CRM uses Elysera's existing Supabase authentication, verified accounts, MFA checks and `ElyseraAdminAccess` grants. It does not redirect to PeptiKing or use a second session system. `/api/crm-auth/start` accepts only the two CRM return paths and redirects to the native `/auth/admin` or `/auth/signin` page. Password/MFA sign-in returns to the requested CRM. Google sign-in keeps its existing dashboard destination, from which the CRM is accessible in the menu.

Members additionally require an active Diamond membership, administrator CRM approval, and the shared CRM password. Unlock cookies remain bound to the account, approval version, and password. CRM signatures and rate limiting use the already-configured `ELYSERA_RATE_LIMIT_SECRET`.

## Records and operations

Existing shared PostgreSQL CRM tables remain in place: `CrmMember`, `CrmSettings`, `CrmLead`, `CrmActivity`, and `AiRateLimitBucket`. No data copy or production schema migration is required. The Prisma file is a partial projection of the shared database: use `prisma generate`, **not `prisma db push` against production**.

CSV import/review and deduplication, member approval, daily allocation, notes, outcomes, call tracking, follow-up dates, activity history and optimistic version checks are preserved. Allocation is serialized in PostgreSQL and limited to 50 leads per member per Berlin calendar day. Members can claim their allowance and administrators can allocate to the team.

The optional `/api/cron/allocate-crm-leads` endpoint requires `CRON_SECRET`; no new production cron or secret was configured by this login fix. To automate distribution, configure that secret and schedule the authenticated endpoint on one deployment.

## Release verification

- Rebased the CRM onto the latest Elysera main branch, preserving its newer storefront, account and admin features.
- Production build and TypeScript passed.
- Six CRM parsing, quota, token, and login destination tests passed.
- Four native CRM identity/redirect tests and six existing account/admin tests passed.
- The copied CRM operations previously passed isolated PostgreSQL integration tests; this release replaces the authentication boundary, covered by the native access tests.
- Live checks must confirm the start endpoint redirects to Elysera login, both CRM pages load, and anonymous data requests return 401.

The earlier local PeptiKing handoff implementation is superseded. Do not activate `ELYSERA_CRM_URL` or deploy that handoff for this release.

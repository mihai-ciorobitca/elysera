# Elysera lead CRM

Routes: `/admin/crm` and `/dashboard/crm`. The existing admin menu, partner dashboard menu, and storefront footer link to the CRM.

## Authentication

The CRM uses Elysera's existing Supabase authentication, verified accounts, MFA checks and `ElyseraAdminAccess` grants. It does not redirect to PeptiKing or use a second session system. `/api/crm-auth/start` accepts only the two CRM return paths and redirects to the native `/auth/admin` or `/auth/signin` page. Password/MFA sign-in returns to the requested CRM. Google sign-in keeps its existing dashboard destination, from which the CRM is accessible in the menu.

Members additionally require an active Diamond membership, administrator CRM approval, and the shared CRM password. Unlock cookies remain bound to the account, approval version, and password. CRM signatures and rate limiting use the already-configured `ELYSERA_RATE_LIMIT_SECRET`.

## Records and operations

Existing shared PostgreSQL CRM tables remain in place: `CrmMember`, `CrmSettings`, `CrmLead`, `CrmActivity`, and `AiRateLimitBucket`. No data copy or production schema migration is required. The Prisma file is a partial projection of the shared database: use `prisma generate`, **not `prisma db push` against production**.

CSV import/review and deduplication, member approval, persistent batch allocation, notes, outcomes, call tracking, follow-up dates, activity history and optimistic version checks are preserved. Allocation is serialized in PostgreSQL. Members receive batches of up to 50 only when none of their assigned leads remain NEW, regardless of assignment date. Saving Contacted or another non-NEW outcome marks a lead as worked; opening a contact link alone does not. Administrators can allocate to ready members or explicitly give an individual member a chosen positive whole-number quantity of extra leads even with unfinished work. Existing assignments and history remain visible with All leads / All statuses selected by default. There is no daily reset. Custom admin quantities are validated against the available pool inside the allocation transaction; insufficient stock rejects the request without partial assignment.

The optional `/api/cron/allocate-crm-leads` endpoint requires `CRON_SECRET`; no new production cron or secret was configured by this login fix. The endpoint follows the same unfinished-lead gate and never overrides it. To automate distribution, configure that secret and schedule the authenticated endpoint on one deployment.

## Release verification

- Rebased the CRM onto the latest Elysera main branch, preserving its newer storefront, account and admin features.
- Production build and TypeScript passed.
- Six CRM parsing, quota, token, and login destination tests passed.
- Four native CRM identity/redirect tests and six existing account/admin tests passed.
- The copied CRM operations previously passed isolated PostgreSQL integration tests; this release replaces the authentication boundary, covered by the native access tests.
- Live checks must confirm the start endpoint redirects to Elysera login, both CRM pages load, and anonymous data requests return 401.

The earlier local PeptiKing handoff implementation is superseded. Do not activate `ELYSERA_CRM_URL` or deploy that handoff for this release.

## CSV fields and contact drafts

Full HarvestMyData exports are accepted, including extra and empty columns. Name, phone, email, username and source keyword are checked by default. Country, category, biography and website can be added explicitly. The keyword is stored in the existing CrmLead.source column; old HarvestMyData source labels display as an unknown keyword. Valid Instagram-only contacts can now be imported and allocated. Imports remain preview-first and skip duplicates without changing existing conversations.

Each accessible lead offers call, WhatsApp, email, Instagram profile and Instagram DM links. Individual templates support {name}, {username} and {keyword}. Templates are saved per account in browser local storage; they do not sync between devices. WhatsApp and email open populated drafts. Instagram messages are copied for pasting into the DM.

Email selection is limited to 30 leads on the current page and clears when the view refreshes or changes. The email-draft API rechecks account access, lead ownership, email availability and do-not-contact status before returning recipients. Bulk compose opens a BCC draft in the user's mail application with an editable shared subject and body. The CRM does not send these drafts itself.

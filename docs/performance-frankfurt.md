# ELYSERA performance and Frankfurt rollout

## Observed production baseline

Measured from the same client connection on 2026-09-18 (Asia/Bangkok).
The Vercel response header was hkg1::iad1: edge ingress Hong Kong, application execution Washington, DC.
The shared Peptiking Europe Supabase project reports eu-central-2 (Zurich).

| Request | Baseline response time |
| --- | ---: |
| Password login | 4,065 ms |
| Authenticated dashboard HTML | 5,459 ms |
| Dashboard data, first request | 3,972 ms |
| Dashboard data, warm request | 3,461 ms |

These are individual HTTP measurements, not Core Web Vitals or guarantees for all visitors.

## Changes

- Configure Vercel application execution in fra1 (Frankfurt) for new deployments.
- Resolve customer/admin login with a single provider identity check and joined business-account lookup.
- Read first-login state with the account; keep the existing atomic write for first visits only.
- API handlers perform their own authentication and cookie refresh instead of duplicating it in the proxy. Page session refresh, impersonation restrictions and every handler's authorization remain in place.
- Run the four independent dashboard data queries concurrently after authorization.
- Exclude the storefront shell and its product requests from account/admin pages. Load secondary dashboard sections when opened.
- Initially load only the first gallery image (192 KB rather than all four, 917 KB); warm the next slide after three seconds when motion is enabled.

No account authorization is cached across requests. Blocked accounts, email/identity matching, MFA, admin access, impersonation and mixed-brand order filtering retain their existing rules.

## Database relocation still requires a separate migration

Setting fra1 does not move Supabase data out of Zurich. Supabase requires a new project in eu-central-1 to relocate to Frankfurt. The existing project is shared by ELYSERA and PeptiKing.

Before creating the destination: confirm the organization and quoted recurring project cost. Before switching traffic: back up and restore the database including Auth; inventory and copy Storage, Edge Functions, extensions, scheduled jobs, secrets, RLS/grants, SMTP and OAuth configuration. Compare row counts and constraints, verify both applications and recovery/MFA flows, then schedule the final data synchronization and switch both applications' connections together. Keep the Zurich project for rollback until verification is complete. Do not delete the source as part of this performance change.

References:
- https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z
- https://supabase.com/docs/guides/platform/migrating-within-supabase
- https://vercel.com/docs/functions/configuring-functions/region

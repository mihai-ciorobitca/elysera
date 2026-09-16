# Referral and admin verification — 2026-09-16

## Live database, read-only checks

- Original import: 2,448 accounts and partner profiles; 2,425 parent links and 23 roots.
- Full recursive source/target path comparison: 0 differences.
- Missing profiles, missing parents, unreachable imported nodes and mismatched entry dates: 0.
- Imported statuses: 2,438 active, 10 paused.
- Admin partnerGraph evaluated with an anonymized copy of the actual graph:
  all 2,448 profiles and 6,118 ancestor positions match the source.
- During verification one new source account was created at 16:33:53 UTC.
  It has no Elysera profile and was not part of the original import.
  No additional import or continuous synchronization was performed.

## Financial separation

Only SQL-scoped Elysera product orders were inspected. Ten exclusively
Elysera orders exist, all PENDING. There are no matching Elysera commissions
and no ElyseraCreditLedger entries. No Peptiking revenue values were requested.
Mixed orders remain excluded. Empty accounts do not inherit shared balances.

## Defect found and corrected locally

The admin customer endpoint returned only the latest 1,000 profiles,
preventing 1,448 imported profiles from being searched or exported.
The endpoint now returns all Elysera customer profiles to the existing
client pagination/search/export. A regression test covers all 2,448 rows.
No production application deployment was performed.

## Automated verification

54 tests passed across customer access, partner graph, financial scoping,
credits, reports, dashboard, network and registration.
TypeScript checking and whitespace validation passed.

## Browser verification limitation

The live /admin URL correctly redirects an unauthenticated session to
/auth/admin. User admin sign-in was requested in the opened Chrome tab.
Authenticated customer search, hierarchy, profile detail dialogs and the
partner dashboard have NOT yet been visually verified.
The new customer-list correction and earlier network/registration changes
are local only and require deployment before production verification.

## Local browser verification completed

The user requested local work instead of production browser login.
An isolated HTTP server runs at http://127.0.0.1:3002 using the actual
CustomersWorkspace, PartnerWorkspace and PartnerNetwork React components.
Its read-only fixture API uses the anonymized imported graph; names,
contact fields, dates, membership and empty financial histories are test
fixtures. This is a component integration test, not production authentication
or an end-to-end database/API test. Non-GET requests are rejected.

Verified in the browser:
- All 2,448 customer profiles are counted; pagination advances to page 2.
- An account beyond the former 1,000-row limit is searchable and its
  detail dialog opens and closes successfully.
- Admin totals show 2,448 configured profiles and 2,425 parent links.
- Hierarchy row and detail dialog agree on the selected parent.
- Paused filter shows the ten paused profiles.
- The largest root shows 2,357 descendants: 337 direct and 2,020 indirect.
- Opening a two-child branch, returning to its parent and selecting the
  deepest existing level work. The depth is data-driven, not an import cap.
- Narrow viewport checks at 390px show no horizontal document overflow.
- Browser error log is empty.

The local harness is under ignored .local-qa/ and has no production database
credentials. Start it with node .local-qa/referral-server.cjs.

## Approved real local data import

After explicit user approval, imported a fresh read-only source snapshot into
.local-qa/private/referrals-real.sqlite (SQLite): 2,450 accounts and 2,427
referral links. The two accounts created after the original 2,448-account
production import are included in this local snapshot only.

Imported fields: IDs, names, emails, affiliate codes, parent IDs, blocked
status and timestamps. Addresses, phone numbers, credentials, passwords,
memberships and financial data were not imported.

All 2,450 identity/referral rows were compared with the source export:
zero differences, no foreign-key violations, SQLite integrity check OK.
Local order, commission and credit tables have zero records.

The local test server now reads this SQLite copy. Browser verification
confirms the real names, 2,450 configured profiles, 2,427 relationships,
and named parents in the hierarchy view. The local UI remains a component
harness with local test endpoints; production PostgreSQL queries and
authentication are not exercised by this harness.

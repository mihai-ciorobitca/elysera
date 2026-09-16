# Local functional check — 2026-09-17

Scope: localhost:3002 component harness backed by the approved real SQLite
identity/referral snapshot. This is not the full Next.js app.

## Passed
- 2,450 identity records and 2,427 parent links; all 6,120 ancestor positions
  match the source snapshot with no differences.
- Browser renders 2,450 partner detail buttons in the admin list.
- Customer count 2,450; pagination advances to page 2 of 245.
- Real-name search narrows to the matching customer.
- Admin hierarchy row and detail dialog show the same named parent.
- Empty address filter displays an empty state and disables export.
- Partner branch navigation opens the correct two children; back works.
- List mode shows 197 pages for the 2,357-descendant main root.
- Deepest existing level filter shows five level-seven descendants.
- Local financial tables remain empty.
- 35 relevant route/policy tests passed in this run.
- No browser console errors recorded.

## Not working / not implemented in the local harness
- All non-GET requests return 405. Contact save, membership changes and
  impersonation are therefore not functional.
- Membership endpoint returns a hardcoded NONE placeholder, not imported
  membership data. It must not be treated as a verified account status.
- Addresses and phone numbers were not imported. Their empty display is
  expected for this snapshot, not evidence of source-data completeness.
- Customer and partner detail endpoints return empty order/commission
  arrays; the harness does not test billing or real financial workflows.
- Network root is fixed to the largest root, rather than a signed-in account.
  Authentication, registration and account switching are not exercised.
- CSV export was clicked, but the browser download event timed out.
  Download completion/file contents are unverified; no console error appeared.

Conclusion: identity/referral display and read navigation passed. A statement
that all application functions work would be incorrect.

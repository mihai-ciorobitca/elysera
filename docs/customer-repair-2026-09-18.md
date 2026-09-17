# Customer contacts and first ELYSERA login

## Live database repair

Project `psmitgghbgwifdimftrk` contained 2,468 User rows but only 2,448
ELYSERA account/partner profiles. The 20 absent accounts were created after
the original referral snapshot. `scripts/repair-elysera-customer-contacts.sql`
has now run successfully against the live database.

- Account profiles: 2,468. Missing account/partner profiles: zero.
- Profiles with a telephone: 2,293 (previously one).
- Profiles with a street/address line: 319, all accounts with an approved
  source address covered. The source also contains a rejected address;
  rejected addresses were not imported.
- Complete structured addresses: 273. Unambiguous trailing house numbers
  were separated; other address lines remain intact and incomplete rather
  than inventing a house number.
- Existing ELYSERA contact values and existing partner relationships were
  preserved. Missing partner records use the source parent. No shared
  account, authentication, financial or order records were modified.

This is a reconciliation of current source accounts, not an ongoing sync
of future registrations on other sites. Normal ELYSERA registration already
creates account and partner profiles together.

## Login activity

The `elysera_first_login` database migration is applied. Its SQL is also
saved in `scripts/setup-elysera-first-login.sql`.

Application code records the first verified ELYSERA access after identity,
MFA and account authorization succeed. An existing authenticated session's
first visit after deployment also qualifies. No timestamps are inferred
from shared Supabase authentication history. Impersonation records only
the real administrator, never the viewed customer's activity.

An atomic conditional upsert preserves one timestamp per account without
changing the contact edit version. Account-profile RLS remains enabled
without client policies; activity is exposed by the admin-authorized API.
The admin list/details show the timestamp in Europe/Berlin, support active
and unrecorded filters, and export the timestamp as UTC in CSV.

**Application deployment has not been performed.** Login recording and its
admin UI require deploying the local application changes. The contact and
missing-profile corrections are already live and use the existing API.

## Verification

- 29 account, customer, partner, sign-in, MFA, impersonation and activity tests passed.
- Production Next.js build and TypeScript checks passed.
- Browser component checks at 390 and 1440 px using 2,468 synthetic accounts:
  pagination, last account, activity filters, timestamp, details, downloaded
  CSV contents, empty state and horizontal overflow passed.
- A temporary PostgreSQL table verified repeated first-login writes retain
  the original timestamp and contact version; transaction rolled back.
- Live aggregate reconciliation and RLS checked. No real customer login
  was simulated; end-to-end production login remains a post-deployment check.

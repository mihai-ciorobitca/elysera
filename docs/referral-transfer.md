# Referral transfer — 2026-09-16

The authorized database import completed in project psmitgghbgwifdimftrk.
2,448 existing identities now have Elysera account and partner profiles.
All 2,425 non-null parent links match User.referredById exactly; 23 roots retain
their null parent. No identities, referral codes, source links, or passwords
were modified. Existing Elysera profile details were preserved.

scripts/import-peptiking-referrals.sql contains the transaction. It validates
the entire graph without a depth cutoff and rolls back on orphaned or cyclic
source data. It reads no financial tables or financial fields and copies none.
Repeated execution preserves unchanged rows and existing partner status.

Names and identities remain shared; the imported Elysera graph is stored in
ElyseraPartnerProfile. Both admin and customer network routes use that graph.
New Elysera registrations write their partner link in the registration
transaction. Later Peptiking reparenting does not move the Elysera snapshot.

Revenue queries are restricted in SQL to orders containing exclusively the
explicit Elysera catalog IDs. Mixed and Peptiking-only orders, unrelated
commissions, and shared user credit balances are excluded. Elysera credits
use ElyseraCreditLedger. This import neither resets existing Elysera orders
nor introduces opening balances or historical sales.

Database import is live. Application changes require the usual deployment;
no application deployment was performed as part of this transfer.

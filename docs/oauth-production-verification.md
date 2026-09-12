# ELYSERA Google login: production verification

Verified on 2026-09-12.

## Redirect configuration fix

Production `/api/auth/google` correctly requested
`https://www.elysera.org/auth/google/callback`, but that URL was absent from
the shared Supabase Auth redirect allowlist. The provider consequently fell
back to its existing PeptiKing Site URL.

Added exactly `https://www.elysera.org/auth/google/callback` to the production
allowlist. The existing Site URL and five existing redirect entries were
preserved. This provider-side fix takes effect without an application deploy.

## Real browser verification

Started Google sign-in from `https://www.elysera.org/auth/signin` and selected
the affected existing Google account. Authentication returned successfully to
`https://www.elysera.org/auth/complete-profile`, not PeptiKing. This protected
page requires `currentUser()` and displayed the existing account name.

The account has no required address, so the completion form is the expected
gate before dashboard access. No address was invented or saved. Dashboard
entry after completing that form was not verified in this live test.

## Remaining brand limitation

Google's account chooser still displays the shared OAuth application's
PeptiKing name and legal links. The redirect fix does not change that consent
branding. Do not rename the shared OAuth application globally: doing so would
also change the PeptiKing login experience. Independent ELYSERA consent
branding needs a separately scoped provider configuration.

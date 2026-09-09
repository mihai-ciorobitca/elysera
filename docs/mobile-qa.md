# Mobile storefront review — 10 September 2026

Reviewed all 15 storefront routes: home, shop, all three product pages, routine,
science, about, FAQ, contact, presale, account, quiz, checkout and video selection.

## Validation

- Production build: `npm run build` passed, including all generated routes.
- Chromium: all 15 routes at 320, 390, 768 and 1440 CSS pixels.
- WebKit: all 15 routes at 390 CSS pixels.
- All 75 route/viewport checks passed: HTTP 200, no document overflow, clipped
  text, missing images or uncaught browser errors.
- 60 interaction checks passed in each browser, including menu navigation,
  search and empty results, shop filtering/sorting, set selection, quantity
  updates/removal/persistence, checkout totals, all three galleries, image
  enlargement/focus restoration, quiz results/reset, FAQ and carousel changes.
- WebKit at 3x pixel density loaded the 1680px toner portrait and 1120px serum
  portrait successfully, avoiding the full lossless images on these screens.
- Screenshots were visually reviewed for page layouts, open dialogs and quiz
  results. These are browser-emulated viewports, not physical-device tests.
- The selection flow was tested without submitting an order or payment.

## Repeat the checks

The scripts require Playwright resolvable by Node and its Chromium/WebKit browser
binaries. An existing tooling runtime can be supplied through `NODE_PATH`.

For an isolated production preview, set `ELYSERA_BUILD_DIR=.next-build`, run
`npm run build`, then run `node node_modules/next/dist/bin/next start -p 3002`
with the same environment variable. The normal development server keeps using
`.next` and port 3001.

Set `AUDIT_URL=http://localhost:3002`, then run:

```text
node scripts/mobile-release-audit.cjs
node scripts/mobile-release-interactions.cjs
```

Optional environment variables:

- `AUDIT_BROWSER`: `chromium` (default) or `webkit`.
- `AUDIT_WIDTHS`: comma-separated widths; default `320,390,768`.
- `AUDIT_OUT`: local directory for screenshots and JSON results.

The scripts use isolated browser sessions and leave the user's browser/cart
untouched. Generated QA output stays local.

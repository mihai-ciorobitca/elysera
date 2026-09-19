# Page and image reuse audit — 20 September 2026

Scope: live ELYSERA routes, rendered image sources, shared components and representative desktop/mobile visual inspection. This is a focused duplication and art-direction review, not a complete accessibility certification or authenticated business-workflow test. No site changes were made during this audit.

## Priority findings

1. **About duplicates Routine's serum portrait.** `/about` opens with `/media/ritual-editorial-2026/serum-1120.webp`, also used for step 02 on `/routine`. A skincare application picture does not establish the people or origin of the brand. Give About a dedicated brand/founder-led opening; keep the serum picture in Routine.
2. **Home, Shop and Set detail repeat the entire set promotion.** All render the same `RitualSet` component: collection photo, heading, product list, price, CTA and copy. The Set detail page offers little visual progression after clicking from Shop. Keep a compact promotional version on Home, a shopping version on Shop, and give Set detail its own gallery and expanded product information. Its current “Das Ritual entdecken” link also points back to the same detail page.
3. **Presale and About reuse the same tall hero image.** Both use `/media/wavespeed-4k/hero-mobile.webp`; Home's mobile hero also uses this image family through picture sources. Presale places this narrow composition in a wider split, producing empty side bands and small products. Use a dedicated near-square close product grouping for Presale. About's closing CTA does not need another large copy of that campaign image.
4. **Science and Routine share the serum texture image/video.** Both resolve to `/media/wavespeed-4k/serum-texture.webp` and the serum texture loop. This is relevant imagery, but Science needs a distinct explanatory focal section rather than looking like another texture promotion. Prefer a formulation/process composition or purposeful ingredient visualization, clearly illustrative where appropriate.
5. **Account imagery is a different visual world.** Sign-in, registration, resend and admin sign-in use the same four-slide lifestyle gallery: supercars, holiday, business and yacht. Shared account layout is sensible; the conspicuous lifestyle imagery is less coherent with the newer understated skincare/support photography. Consider one calm account-family art direction. Admin sign-in does not need a consumer lifestyle slideshow.
6. **Several editorial pages have the same visual grammar.** Contact and Presale use the same `route-banner` split followed by three supporting columns; About's closing CTA also uses `route-banner`. Science uses a similar image/copy split followed by three knowledge columns. This is component reuse, not identical whole pages, but the accumulated repetition weakens page identity. Distinguish their lead sections while retaining navigation, spacing tokens and functional controls.
7. **Different generations of campaign imagery remain mixed.** Home's three-step collage, product-application gallery photos, new daylight ritual portraits, CGI-style product scenes and the lifestyle account gallery have visibly different art direction. Assess their roles as a series before generating more isolated replacements.

## Confirmed reuse map

| Asset / component | Locations | Assessment |
|---|---|---|
| `ritual-editorial-2026/serum-1120.webp` | About opening; Routine step 02 | Unnecessary editorial duplication; replace About use |
| `wavespeed-4k/hero-mobile.webp` family | Presale opening; About closing; Home mobile poster | Presale needs its own composition |
| `atelier-2026/collection.webp` | Home set promo; Shop set promo; Set detail; small Presale delivery thumbnail | Repeated large set promo is excessive; small product-identification use is fine |
| `RitualSet` full component | Home; Shop; Set detail | Give the detail page a distinct role and composition |
| `wavespeed-4k/serum-texture.webp` and serum loop | Routine textures; Science feature | Relevant reuse, but Science's lead should be more distinctive |
| `bettina/portrait-confident.webp` | Home founder teaser; About biography | Useful identity consistency; retain |
| `jessica/portrait-confident-1122.webp` | Home founder teaser; About biography | Useful identity consistency; retain |
| `atelier-2026/toner.webp`, `serum.webp`, `eye.webp` | Home, Shop, each product page, Set detail | Correct reuse of canonical product packshots; retain |
| `login-lifestyle/{supercars,holiday,business,yacht}.webp` | Sign-in; registration; resend; admin sign-in | Same gallery confirmed in source; art direction should be reassessed |
| `wavespeed-4k/hero-desktop.webp` | Forgot password; reset password; email verification | Shared account recovery imagery is acceptable |
| `contact-support-v2` | Contact | Dedicated and purpose-appropriate; retain |

## Route coverage and page roles

| Route / family | Observation |
|---|---|
| `/` | Distinct landing composition; repeated set feature and legitimate product/founder teasers |
| `/shop` | Catalog layout is distinct, but large set feature duplicates Home/Set detail |
| `/routine` | Distinct three-step sequence; new model portraits and selected texture loops |
| `/science` | Distinct subject, but familiar split/three-column composition and reused texture lead |
| `/about` | Founder content is specific; lead image is borrowed from Routine; closing image from Presale |
| `/contact` | Dedicated support image; composition still shares the route-banner pattern |
| `/presale` | Delivery content is specific; hero composition is poorly matched to its frame |
| `/faq` | Shared typography, appropriate text/accordion-focused layout; no image required |
| `/quiz` | Distinct interactive question layout; no decorative hero required |
| `/checkout` | Saved-selection view; functional layout, no decorative image required |
| `/products/balance-toner` | Shared product template with dedicated packshot/application images |
| `/products/renewal-serum` | Shared product template with dedicated packshot/application images |
| `/products/contour-eye-cream` | Shared product template with dedicated packshot/application images |
| `/products/peptide-ritual-set` | Mostly the repeated set feature plus brief use/delivery copy |
| `/news` | Distinct editorial template; no published articles visible during review, so article imagery cannot be compared live |
| `/agb`, `/datenschutz`, `/impressum`, `/widerruf` | Same legal reading template; appropriate consistency, no images required |
| `/auth/signin`, `/auth/register`, `/auth/resend`, `/auth/admin` | Same lifestyle gallery, different forms; intentional layout reuse, questionable imagery fit |
| `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` | Same recovery-page image and layout; appropriate functional consistency |
| `/account`, `/dashboard`, `/auth/complete-profile`, `/auth/change-password` | Redirected to sign-in in this browser session; private content not visually audited |
| `/admin` | Redirected to admin sign-in; private admin screens not visually audited |
| `/dashboard/crm`, `/admin/crm` | CRM route shells reached; no public storefront imagery; authenticated internal states not certified |
| `/community-chat` | Redirects to Contact; no separate community page remains |
| `/maintenance` | Utility surface; no main-content image in rendered DOM |
| `/video-auswahl` | Utility video-selection surface; not part of the normal storefront journey |

## Evidence and limits

- Inspected 36 route URLs, including redirects and utility screens. Compared image `src` values in rendered main content; checked component source to include carousel slides and responsive picture variants not all present in the initial DOM.
- Desktop viewport 1440×1000; representative mobile views 390×844. No horizontal overflow in the 26 primary public/account screens scanned at desktop width. This is not a full mobile regression test of every state.
- Image placeholders visible during immediate navigation were checked against loaded images; they are not counted as permanent missing-image bugs.
- Repeated thumbnail/lightbox instances on a single product page are not treated as editorial duplicates.
- No automatic design score or claim of perfect uniqueness. Findings distinguish measurable identical asset/component reuse from subjective art-direction judgment.

Recommended order: About opening, Presale hero, distinct Set detail, Science lead, then coherent account imagery. Keep canonical product packshots, founder identity photos and shared functional UI consistent.

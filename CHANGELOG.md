# Maintenance release 2.0.0 — 2026-10-19

Preserves the existing vanilla HTML/CSS/JS application and Supabase project. No live deployment or database mutation performed.

## Commerce
- Shared, tested price/stock/phone/escaping rules in assets/store-core.js.
- Guest checkout; required shipping/address; explicit unknown-shipping state.
- Before-discount free-shipping threshold consistent across cart and checkout.
- Fresh catalog/settings/zones lookup before submission; review on changed totals.
- Server coupon revalidation; no private coupon-list query or fabricated welcome offer.
- Per-variant inventory budget shared across bottle colors; cached cart repricing.
- Request-in-flight guard and uncertain network outcome handling; 25s request timeout.
- Persistent receipt UI with copy, tracking and optional encoded WhatsApp link.

## Accounts and administration
- New email-based customer registration; legacy phone/password login retained.
- Password recovery page requiring Supabase recovery event.
- Fail-closed administrator UI permission RPC and deferred initialization of extras.
- Additive admin-membership SQL and read-only security export; neither substitutes for reviewing current RLS/RPCs.
- CSV formula-prefix mitigation and paginated data export.

## Presentation and delivery
- Mobile form usability, modal focus containment and reduced-motion support.
- Existing brand image extracted from inline base64 and reused for social metadata.
- Incomplete public-page placeholder text replaced with actionable contact instructions.
- Whitelisted static build into dist; private files never copied into deployment output.
- First-party commerce event bridge, with no third-party tracker loaded or invented IDs.

## Known deployment gates
Review server authorization and order calculation using the supplied audit; set administrator membership; configure and test email redirects; test real browser layouts and staging order flow. English translation remains partial. No live payment tests or verified speed/SEO score claimed.

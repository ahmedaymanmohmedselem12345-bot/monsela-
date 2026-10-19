# Validation evidence — 2026-10-19

**81 local automated checks passed, 0 failed.**

Command: `node --test --test-timeout=5000 tests/*.test.cjs`

- 35 commerce rule tests: Egyptian/Arabic/international phone normalization, shipping, gift fees, discounts, stale prices, removed/disabled/out-of-stock products, duplicate quantities, variant/color inventory, URL encoding and HTML escaping.
- 14 checkout flow tests run the actual checkout functions against an in-memory DOM/API adapter: guest order, required fields, consent, repeat click, stock/price changes, coupon expiry, explicit rejection, network uncertainty, missing receipt and payment mismatch.
- 4 administrator gate tests: anonymous/unauthorized/missing RPC deny; verified administrator initializes once.
- 28 syntax, asset-reference and structural checks: all inline scripts and JSON-LD parse, external local scripts parse, referenced assets exist, private coupon query removed and password recovery gated.
- Node static build completed successfully; only the explicit public whitelist and assets are emitted.
- Static HTML parser found no duplicate IDs in index.html.

**Limits:** these are not browser E2E tests. In-memory DOM adapters do not render CSS or verify layout, focus behavior, actual Supabase auth, SQL execution, RLS policies, concurrency or email delivery. Browser access was denied and no alternative egress path was used. Database definitions are absent from the supplied archive; no SQL migration was executed against production. No actual orders, payments, customer messages or account changes were made.

# Security

## Authentication

Supabase Auth identifies users. Passwords are never stored by the app.

## Authorization

UI visibility is not a security boundary. PostgreSQL RLS enforces:

- profile ownership
- post ownership
- private saved items
- group membership
- conversation membership
- message sender membership
- marketplace seller/buyer ownership
- job applicant privacy
- civic report ownership/admin review
- service request ownership

## Storage

All configured buckets are private.

Object paths begin with the authenticated UUID:

```text
bucket/<auth.uid()>/file.ext
```

Storage policies check that first path segment.

## Secret management

Client `.env`:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Never expose:

- `sb_secret_...`
- service-role key
- database password

## Political/election integrity

The election feature is a community **mock ballot sandbox**. It is not an official voting system, does not connect to COMELEC, and must never be represented as an official election result.

## Finance

`wallets` and `wallet_transactions` are civic/demo credit records, not bank/e-money balances.

Marketplace order records are status/workflow records, not escrow custody.

Charity uses pledge records only. Real payments require a payment service and legal/compliance review.

## Healthcare

The MVP does not store a complete electronic medical record. Public capacity/service cards are non-sensitive. A future patient-data feature needs a separate threat model, access model, audit logging, data retention policy, and applicable Philippine privacy/legal review.

## Moderation and public data

Production should add:

- abuse/report queues
- content moderation workflows
- verified-source provenance
- admin audit logs
- rate limiting
- spam controls
- account/device abuse controls
- retention and deletion policies


## PWA cache boundary

The web service worker never intercepts cross-origin requests, so Supabase Auth/Data/Storage traffic is not placed in the application cache. Navigation is network-first and static assets use a bounded versioned cache.

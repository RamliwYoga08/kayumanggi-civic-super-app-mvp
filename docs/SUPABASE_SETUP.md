# Supabase Setup Guide

This guide assumes you are new to Supabase.

## A. Create the project

1. Open the Supabase Dashboard.
2. Create a new project, for example `kayumanggi-civic-app`.
3. Save the database password somewhere private.
4. Choose a region appropriate for your target users.

## B. Copy the two client values

Open the project **Connect** panel or **Settings → API Keys**.

Copy:

- Project URL
- Publishable key starting with `sb_publishable_`

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

These are the only Supabase credentials that belong in the Expo client.

Do not place these in any `EXPO_PUBLIC_` variable:

- `sb_secret_...`
- service-role key
- database password
- private tokens

## C. Run database migrations

Open **SQL Editor → New query**.

Run all of:

```text
supabase/migrations/001_schema.sql
```

Then:

```text
supabase/migrations/002_rls.sql
```

Then:

```text
supabase/migrations/003_realtime.sql
```

Do not disable RLS to solve application errors. Fix the policy/path mismatch instead.

## D. Optional demo content

Run:

```text
supabase/seed.sql
```

This creates only public demo/system content. It does not create fake Auth users.

## E. Authentication configuration

Open **Authentication → Providers**.

Enable email/password.

For local web development use a Site URL similar to:

```text
http://localhost:8081
```

Allow redirect URLs such as:

```text
http://localhost:8081/**
kayumanggi://**
```

When you deploy the web app, add your real HTTPS domain.

## F. Storage buckets

The app expects five private buckets.

Create a temporary secret key in **Settings → API Keys → Secret keys**.

Use it only in the terminal. Do not paste it into `.env`, source code, GitHub, screenshots, documentation, or chat.

### Kali / Zsh

```zsh
(
  source .env
  export SUPABASE_URL="$EXPO_PUBLIC_SUPABASE_URL"
  read -s "SUPABASE_SECRET_KEY?Paste temporary sb_secret_ key: "
  echo
  export SUPABASE_SECRET_KEY
  npm run setup:storage
)
```

Expected bucket names:

```text
avatars
post-media
marketplace-media
message-attachments
civic-evidence
```

Keep them private.

## G. Test account

Start the app:

```bash
npx expo start -c
```

Press `w`.

Create an account. If email confirmation is enabled, confirm it from your inbox.

Check:

- Authentication → Users
- Table Editor → `profiles`
- Table Editor → `user_roles`
- Table Editor → `wallets`

The signup trigger should create a profile, citizen role, and zero-balance demo civic-credit wallet.

## H. RLS smoke test

Create two user accounts.

Verify:

- User A cannot edit User B's profile.
- User A cannot read User B's private conversations.
- User A cannot send a message into a conversation they do not belong to.
- User A cannot update User B's marketplace listing.
- User A can vote only once per poll/election sandbox record because unique constraints enforce replacement/upsert behavior.


# Kayumanggi Civic Super App MVP

A universal **React Native + Expo + Supabase** conversion of the supplied Kayumanggi Civic Super App HTML prototype.

The original file was a very large single HTML document with Tailwind, DOM event handlers, mock JavaScript databases, dropdowns, modal states, and 40+ views. This project converts that concept into a modular application with real authentication, persisted PostgreSQL data, Row Level Security, Realtime messaging, private Storage foundations, responsive React Native layouts, and an installable web manifest.

## What is preserved

- Kayumanggi dark theme: `#09090b` background, zinc surfaces/borders, `#fafafa` primary text.
- Light-mode equivalent from the original HTML.
- Civic status semantics: green active, red danger, amber warning, blue information.
- Facebook-style desktop header behavior, compact mobile header, and mobile bottom navigation.
- Social + civic + service module structure.
- Home feed with sidebars on desktop and a single-column mobile layout.
- Governance, marketplace, profiles, elections, polls, community, messages, jobs, reports, environment, events and publications.
- The broader original modules remain routed through the data-backed module framework rather than fake buttons.

## Stack

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript 6
- Expo Router
- React Native Web
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase Realtime
- Supabase Storage
- TanStack Query
- AsyncStorage session/theme persistence

## Functional MVP modules

### Authentication
- Sign up
- Email/password login
- Forgot-password email + recovery deep-link flow
- Secure password update screen
- Persistent sessions
- Profile bootstrap trigger
- Sign out

### Social core
- Civic feed
- Create post
- Like/unlike
- Comments
- Save post
- Groups and membership
- People directory
- Direct conversations
- Realtime messages

### Governance
- Public project monitor
- Budget/spending summaries
- Citizen issue reports
- Public-official schema
- Partylists and department schema
- Civic-service resource catalog

### Civic participation
- Candidate directory
- Mock ballot only
- Polls and one-user-one-vote uniqueness
- Events and RSVP
- Debate backend foundation

### Marketplace and opportunity
- Browse listings
- Create listing
- Saved listings
- Order/escrow-status backend foundation
- Jobs
- Job applications
- Resume backend foundation

### Community services
- Lost & found reports
- Environmental reports
- Education
- Healthcare access hub
- Tourism
- Agriculture
- Disaster management
- Volunteer programs
- Public utilities
- Community development
- Economic development

The last group uses `civic_resources` for reliable MVP rendering while keeping room for dedicated schemas later.

## Safety boundaries

Some HTML concepts need real-world integrations before they can be represented honestly in production:

- **Mock elections are not official elections.** `mock_votes` is deliberately separated from election records.
- **Civic Wallet is not a real e-wallet.** It stores demo/reward credits only. Real money requires a licensed payment provider and compliance work.
- **Charity records pledges, not payment captures.** Integrate an approved payment processor before accepting money.
- **Healthcare does not implement a full EHR.** Sensitive medical records need a separate privacy/security design and regulatory review.
- **Government/official verification must be sourced.** Demo seed data is explicitly demonstration content.

## 1. Install

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
```

## 2. Configure Supabase

Create `.env`:

```bash
cp .env.example .env
nano .env
```

Paste only:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Never put an `sb_secret_...` key in `.env`.

Then follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## 3. Run migrations

In Supabase SQL Editor, in this order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_realtime.sql`
4. Optional: `supabase/seed.sql`

## 4. Configure Storage

Use a temporary **server-only** secret key only for the setup process. Do not save it in the Expo environment file.

For Kali Linux / Zsh:

```zsh
(
  source .env
  export SUPABASE_URL="$EXPO_PUBLIC_SUPABASE_URL"
  read -s "SUPABASE_SECRET_KEY?Paste temporary Supabase sb_secret_ key: "
  echo
  export SUPABASE_SECRET_KEY
  npm run setup:storage
)
```

The subshell removes the secret from the current shell environment when it exits.

Buckets created:

- `avatars`
- `post-media`
- `marketplace-media`
- `message-attachments`
- `civic-evidence`

All are private. Access is controlled by RLS policies in `storage.objects`.

## 5. Start

```bash
npx expo start -c
```

- Press `w` for web.
- Use an Android development/preview build for reliable custom-scheme testing.
- iOS development requires the usual Apple/macOS tooling for local simulator workflows.

## 6. Validate

```bash
npm run typecheck
npm test
npm run export:web
```

## 7. Web / PWA

The web export includes:

- `public/manifest.json`
- PWA icons
- theme metadata
- conservative service worker registration
- static Expo Router output

Build:

```bash
npm run export:web
```

Output: `dist/`

The included service worker caches only same-origin app/static responses. Cross-origin Supabase/API traffic is never cached, and navigation uses a network-first strategy before falling back to previously visited pages.

## 8. Android APK preview

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## 9. Project map

```text
app/                    Expo Router routes
components/             shared Kayumanggi UI and shell
constants/              theme and module registry
features/               auth/theme providers
hooks/                  responsive helpers
lib/                    Supabase and React Query clients
services/               database and Storage operations
types/                  domain types
supabase/migrations/    schema, RLS, Realtime
supabase/seed.sql       optional public demonstration content
scripts/                Storage setup
public/                 PWA manifest/icons
reference/              original supplied HTML
README/SECURITY/docs    implementation guidance
```

## Documentation

- [Supabase setup](docs/SUPABASE_SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Conversion report](CONVERSION_REPORT.md)
- [Security](SECURITY.md)


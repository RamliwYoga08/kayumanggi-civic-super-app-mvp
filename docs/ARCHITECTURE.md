# Architecture

```text
Android / iOS / Web
        │
        ▼
React Native + Expo Router
        │
        ├── ThemeProvider
        ├── AuthProvider
        ├── TanStack Query
        └── Responsive AppShell
        │
        ▼
Supabase JS Client
   │      │       │       │
   ▼      ▼       ▼       ▼
 Auth  Postgres Storage Realtime
          │
          ▼
     Row Level Security
```

## Why the HTML was not copied component-for-component

The supplied source used a single document with many `view-*` sections and about 145 JavaScript functions that directly manipulated the DOM. In React Native there is no browser DOM on Android/iOS, so those imperative functions were mapped into:

- Expo Router routes
- React component state
- React Query server state
- Supabase tables and RPCs
- responsive layout decisions based on `useWindowDimensions`

This makes the UI portable across phone, tablet, desktop web, and native applications.

## Responsive model

### Phone (<768px)

- Compact top header
- Bottom primary navigation
- Single-column feed
- Sidebars become normal content/menu screens
- Touch-friendly controls

### Tablet (768–1099px)

- Larger content workspace
- Responsive card grids
- No permanently fixed desktop sidebars where they would reduce readability

### Desktop (>=1100px)

- Facebook-style top navigation
- Home left shortcut rail
- Center feed
- Right civic-pulse rail
- Wider bento/card layouts

## Backend domains

Core tables are separated into these bounded contexts:

- Identity and roles
- Social feed and comments
- Community and conversations
- Marketplace
- Governance/transparency
- Civic directory
- Elections sandbox
- Polls/debates
- Charity pledge records
- Events/publications
- Jobs/resumes
- Lost-and-found/environment reports
- Shared civic-service catalog and service requests

The shared `civic_resources` table is deliberate for the less-transactional modules in the MVP. It avoids creating dozens of nearly identical content tables while dedicated modules can be extracted later.


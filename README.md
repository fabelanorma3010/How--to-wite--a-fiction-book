# Storyburst

A playful toolkit for writing comics, manga, cartoons, and children's books — genre tips, an action-text generator, an illustration idea generator, a format-matching quiz, a story notebook, a Fiction Helper chat widget, and a step-by-step publishing guide.

Built with [Next.js](https://nextjs.org) (App Router), React, TypeScript, and Tailwind CSS v4.

## Getting Started

Install dependencies, then run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run oxlint

## Database

Two stores, by design:

- **Turso (libSQL/SQLite)** — powers today's accounts and the community wall.
  Schema is created lazily in [`src/lib/db.ts`](src/lib/db.ts); set
  `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to enable it.
- **Supabase (PostgreSQL)** — the membership/community schema (`users`, `posts`,
  `messages`, `reviews`, `subscriptions`, `files`) lives in
  [`supabase/migrations/`](supabase/migrations). The client is
  [`src/lib/supabase.ts`](src/lib/supabase.ts) (`getSupabase()` for RLS-scoped
  access, `getSupabaseAdmin()` for server-only service-role access);
  [`/api/supabase/health`](src/app/api/supabase/health/route.ts) is a diagnostic
  that reads a couple of rows.

Copy [`.env.example`](.env.example) to `.env.local` for the full variable list.

### Applying the Supabase schema

The schema is already applied to the current project. To reapply it elsewhere,
pick whichever fits:

```bash
# Supabase CLI, hosted project
supabase link --project-ref <your-project-ref>
supabase db push                       # runs supabase/migrations/*

# Supabase CLI, local stack (Docker required)
supabase start && supabase db reset    # migrations + supabase/seed.sql
```

No CLI? Either paste
[`supabase/migrations/20260831120000_membership_community.sql`](supabase/migrations/20260831120000_membership_community.sql)
(then `supabase/seed.sql`) into the dashboard SQL editor, or POST it to the
Management API:

```bash
curl -sS "https://api.supabase.com/v1/projects/<ref>/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data @<(jq -Rs '{query: .}' supabase/migrations/20260831120000_membership_community.sql)
```

### Row Level Security

RLS is enabled on every table with owner-scoped policies that assume Supabase
Auth (`public.users.id` = `auth.uid()`); `posts` (published only) and `reviews`
are also world-readable. Server code using `SUPABASE_SERVICE_ROLE_KEY` bypasses
RLS — keep that key server-side only. If you stay on the app's own password auth
rather than Supabase Auth, the service-role key is how the backend reads and
writes these tables, and the policies act as defense-in-depth for anon access.

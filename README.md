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

## Database & auth — Supabase

One backend: **Supabase (PostgreSQL + Auth)**.

- **Auth** — Supabase Auth (email + password). The visitor login/signup and the
  community wall use it via `@supabase/ssr`
  ([`src/lib/supabase/`](src/lib/supabase)); [`src/middleware.ts`](src/middleware.ts)
  refreshes the session and gates `/admin`. A `handle_new_user` trigger mirrors
  each signup into `public.users`.
- **Schema** — `users`, `posts`, `messages`, `reviews`, `subscriptions`, `files`
  in [`supabase/migrations/`](supabase/migrations), with Row Level Security on
  every table (`posts`/`reviews` world-readable, everything else owner-scoped via
  `auth.uid()`). [`/api/supabase/health`](src/app/api/supabase/health/route.ts)
  is a read-only diagnostic.
- **`/admin`** — a separate Supabase-Auth login gated by `ADMIN_EMAILS`; server
  code uses the service-role client ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts)).

Copy [`.env.example`](.env.example) to `.env.local`.

### Applying migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

No CLI? Paste each file in [`supabase/migrations/`](supabase/migrations) into the
dashboard SQL Editor in filename order, then `supabase/seed.sql`. Set
**Authentication → URL Configuration → Site URL** to your deployed origin so
confirmation emails link correctly.

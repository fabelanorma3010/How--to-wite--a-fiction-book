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

- **Auth** — Supabase Auth: email + password *and* "Continue with Google", one
  system for members and admins. Login/signup, the account page, and the
  community wall use it via `@supabase/ssr` ([`src/lib/supabase/`](src/lib/supabase)).
  [`src/middleware.ts`](src/middleware.ts) refreshes the session on every request
  and gates `/admin` (email on `ADMIN_EMAILS`) and `/account` (signed in); the
  rest of the site — home, tools, `/library` — is public. A `handle_new_user`
  trigger mirrors each signup into `public.users` (name split into
  `first_name` / `last_name`, avatar from Google). [`/auth/callback`](src/app/auth/callback/route.ts)
  is the OAuth / email-link return.
- **Accounts** — [`/account`](src/app/account/page.tsx) lets a signed-in user
  change their first name, last name, email, and password (`getCurrentUser()` in
  [`src/lib/user.ts`](src/lib/user.ts)). Changing email needs confirmation from
  **both** the old and new address (Supabase "Secure email change").
- **Schema** — `users`, `posts`, `messages`, `reviews`, `subscriptions`, `files`
  in [`supabase/migrations/`](supabase/migrations), with Row Level Security on
  every table (`posts`/`reviews` world-readable, everything else owner-scoped via
  `auth.uid()`). [`/api/supabase/health`](src/app/api/supabase/health/route.ts)
  is a read-only diagnostic.
- **`/admin`** — the same Supabase Auth, gated by `ADMIN_EMAILS`; server code
  uses the service-role client ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts)).

Copy [`.env.example`](.env.example) to `.env.local`.

### Applying migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

No CLI? Paste each file in [`supabase/migrations/`](supabase/migrations) into the
dashboard SQL Editor in filename order, then `supabase/seed.sql`.

### Auth dashboard setup (one-time)

1. **Authentication → URL Configuration**
   - **Site URL**: your deployed origin (e.g. `https://www.fiction-book-builder.com`).
   - **Redirect URLs**: add `<origin>/auth/callback` and `http://localhost:3000/auth/callback`.
2. **Authentication → Providers → Email**: enabled. For launch, turn **Confirm
   email OFF** (signups log in immediately) *or* configure custom SMTP first
   (step 4) and leave it on.
3. **Authentication → Providers → Google**:
   - In Google Cloud Console create an **OAuth 2.0 Web application** client. Set
     the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`
     and add your site origin + `http://localhost:3000` as JavaScript origins.
   - Paste the Client ID + secret into the Google provider in Supabase and enable it.
4. **Project Settings → Auth → SMTP**: the built-in mailer is rate-limited and
   not for production — set up custom SMTP (Resend / Postmark / SES / …) before
   relying on signup confirmation, email-change, or password-reset emails.
5. Set `NEXT_PUBLIC_SITE_URL` in the deploy environment.

## Analytics — Umami + Speed Insights

Optional, privacy-focused visitor analytics via [Umami](https://umami.is) and
page-performance monitoring via
[Vercel Speed Insights](https://vercel.com/docs/speed-insights). Both are wired up
in [`src/components/CookieConsent.tsx`](src/components/CookieConsent.tsx), gated
behind an env var *and* the first-visit cookie banner — a visitor who declines gets
neither, regardless of whether the env var is set.

1. Sign up at [cloud.umami.is](https://cloud.umami.is) (free tier is enough for most
   sites) and add your site's domain as a new website.
2. Copy the **Website ID** (a UUID) it gives you.
3. Set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to that value — in `.env.local` for local
   testing, and in your deploy platform's environment variables (e.g. Vercel
   **Project → Settings → Environment Variables**) for production. Redeploy after
   adding it there.
4. Self-hosting Umami instead of using the cloud version? Also set
   `NEXT_PUBLIC_UMAMI_SRC` to your own instance's `script.js` URL.

Visits show up in the Umami dashboard within a few seconds of a page load. Speed
Insights needs no extra setup or account — it activates automatically for any
project deployed on Vercel once a visitor accepts the cookie banner.

## Error monitoring — Sentry

Optional crash/error reporting via [Sentry](https://sentry.io), wired up in
[`src/instrumentation.ts`](src/instrumentation.ts) (server + edge),
[`src/instrumentation-client.ts`](src/instrumentation-client.ts) (browser), and
[`src/app/global-error.tsx`](src/app/global-error.tsx) (catches errors that escape
the root layout itself). Unlike Umami/Speed Insights, this is **not** gated behind
the cookie banner — it exists to catch and fix bugs, not to analyze visitor
behavior, and doesn't set cookies or track anyone across sessions (see
[`/privacy`](src/app/privacy/page.tsx)).

1. Sign up at [sentry.io](https://sentry.io) (free tier is enough for most sites)
   and create a new **Next.js** project.
2. Copy its **DSN** from **Settings → Projects → (your project) → Client Keys
   (DSN)**.
3. Set `NEXT_PUBLIC_SENTRY_DSN` to that value — in `.env.local` for local testing,
   and in your deploy platform's environment variables for production. Redeploy
   after adding it there. Leave it blank to disable Sentry entirely; nothing runs
   without it.
4. Configure how you want to be notified (email, Slack, etc.) in Sentry's own
   **Settings → Alerts** — that part isn't code, it's a dashboard setting on your
   Sentry account.

Optional, for readable stack traces instead of minified code in the Sentry
dashboard: set `SENTRY_ORG`, `SENTRY_PROJECT` (both from the same project settings
page), and `SENTRY_AUTH_TOKEN` (**Settings → Auth Tokens**, scoped to
`project:releases`). Without these three, error capturing still works — source maps
just aren't uploaded.

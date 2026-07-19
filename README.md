# Trip Ledger

A multi-currency trip pricing and profit calculator. Price a trip's
accommodation, transportation, and programs in GBP/EUR/HUF, compare profit
margins across different group-size scenarios, and save trips for later.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Prisma 7** with `@prisma/adapter-mariadb` (driver adapter architecture -
  see "Database" below for why this isn't a plain `DATABASE_URL` setup)
- **MySQL**, hosted on Hostinger in production, or a local Docker container
  for development
- Vanilla CSS (no framework) - a deliberate "ledger" visual style: paper,
  ink, serif headings
- Custom authentication - signed session cookies, no third-party auth
  provider (see "Authentication & authorization" below)

## Project structure

```
app/
  page.tsx                 - new trip form (admin only)
  login/                   - login page
  account/                 - change password (any logged-in user)
  admin/users/             - user management (admin only)
  trips/                   - saved trips list + detail pages
  api/
    auth/                  - login, logout, me, change-password
    admin/users/           - user CRUD (admin only)
    trips/                 - trip CRUD

features/
  TripCalculator/          - the new-trip form and its pricing logic
  TripList/                - saved trips list, search/filter, delete
  TripDetail/              - view/edit a single saved trip
  AdminUsers/               - the admin user-management page
  ChangePassword/          - the change-password form

components/
  AppNav/                  - shared top nav (shows current user, logout, admin link)
  ConfirmationModal/       - generic yes/no confirmation dialog (replaces browser confirm())
  CurrentUserProvider/     - shares one server-fetched "current user" across the whole page
  index.ts                 - barrel export for the above

lib/
  prisma.ts                - Prisma Client singleton (driver adapter config)
  storage.ts               - all trip data access (the only file that knows trips live in MySQL)
  auth/
    session.ts             - signs/verifies the session cookie (no DB access)
    currentUser.ts         - the AUTHORITATIVE auth check (re-reads the DB every time)
    password.ts            - bcrypt hashing/verification
    rateLimit.ts            - basic in-memory login rate limiting

prisma/
  schema.prisma            - describes tables that already exist in MySQL (see below)

proxy.ts                   - Next.js 16's middleware equivalent; page-level route protection

scripts/
  createAdmin.ts            - bootstraps the very first admin account

db/init/001-schema.sql      - the schema, auto-run by the local Docker MySQL container
docker-compose.yml          - local MySQL for development
```

## Getting started

```bash
npm install          # triggers `prisma generate` via postinstall
cp .env.example .env # or .env.docker.example - see "Database" below
npm run create-admin -- your@email.com "a-strong-password"
npm run dev
```

## Database

**Schema management is manual, not via `prisma migrate`.** The tables
(`trips`, `line_items`, `users`) were created by hand in Hostinger's
phpMyAdmin, not through Prisma's migration system - so `prisma/schema.prisma`
is a description of what already exists, kept in sync by hand. Reasons this
is deliberate (not a shortcut):

- Hostinger's shared MySQL plan doesn't support the shadow database
  `prisma migrate dev` needs.
- The tables already have real data and no `_prisma_migrations` history,
  so running Migrate now would flag drift and could offer to reset the
  database as a first "fix."

If a schema change is ever needed: write the `ALTER TABLE`/`CREATE TABLE`
SQL by hand, run it in phpMyAdmin (or the local container), then update
`prisma/schema.prisma` to match, then `npx prisma generate`.

**Prisma 7 uses a driver adapter, not a schema URL.** `prisma.config.ts`
holds `DATABASE_URL` for the CLI only (`generate`/`db pull`/`studio`). The
actual running app connects via `@prisma/adapter-mariadb` in `lib/prisma.ts`,
configured from `DATABASE_HOST`/`PORT`/`USER`/`PASSWORD`/`NAME`. Both need
to be set in `.env` - see `.env.example`.

**Two environments to develop against:**

- `.env.example` → real Hostinger database (production data)
- `.env.docker.example` → local Docker MySQL (`docker compose up`,
  see `docker-compose.yml`) - no `max_connections_per_hour` limit, safe to
  hammer with hot reloads all day. Recommended for day-to-day development;
  switch back to the Hostinger `.env` only to test against real data or
  before deploying.

## Authentication & authorization

Two roles: **admin** (full read/write, manages users) and **user**
(read-only - can view trips but not create, edit, or delete them, and
cannot access user management).

**Invite-only, no public signup.** The only way an account is created is
an admin using the "Add user" form on `/admin/users`, or the bootstrap
script below for the very first account:

```bash
npm run create-admin -- admin@example.com "a-strong-password"
```

**How a session works:** on login, the server signs a JWT (via `jose`)
containing the user's id/email/role and sets it as an `httpOnly`,
`Secure`, `SameSite=Lax` cookie, valid for 7 days. Two different places
check this cookie, deliberately doing different amounts of work:

- **`proxy.ts`** (page-level routing) only verifies the cookie's
  *signature and expiry* - no database call. It decides whether to
  redirect to `/login`, or redirect a non-admin away from an admin-only
  page (`/`, `/admin/*`). This is intentionally lightweight so it doesn't
  add to database connection pressure on every single page view.
- **Every API route** (`lib/auth/currentUser.ts`'s `requireUser()` /
  `requireAdmin()`) is the actual authority: it re-reads the user from the
  database on every call, so a deactivated account or a changed role takes
  effect immediately for any real data operation - regardless of what's
  still encoded in an unexpired cookie.

Because of this split, `proxy.ts` hiding a page is a UX nicety, not the
security boundary - the API route's own check is what actually protects
the data. The UI (`CurrentUserProvider` / `useCurrentUser()`) also hides
admin-only buttons (delete, edit, "+ New trip") for `user` accounts, which
is *also* just UX - clicking one would 403 at the API level regardless.

**Revoking access:** an admin sets a user's `isActive` to `false` from
`/admin/users` ("Deactivate"). Since every API route re-checks this on
every request, it takes effect on that user's very next action - not
after a token expiry. Admins can't deactivate, demote, or delete their
own account (a guard against accidentally locking every admin out).

**Changing your own password:** any logged-in user (either role) can do
this from `/account` - requires the current password, no admin
involvement needed.

**Known gaps, deliberately deferred rather than silently missing:**

- **No "forgot password" flow.** There's no email infrastructure to send
  a reset link. Right now, a lost password means an admin either
  recreates the account or updates it directly in the database.
- **Login rate limiting is in-memory only** (`lib/auth/rateLimit.ts`) -
  resets per warm serverless instance on Vercel, so it's a real
  speed bump against brute-forcing but not an airtight limit at scale.
  Would need Redis/Vercel KV to be bulletproof.

## Local development with Docker

```bash
npm run db:up                    # starts local MySQL, creates tables on first run
cp .env.docker.example .env
npm run create-admin -- you@example.com "password"
npm run dev
```

`npm run db:down` stops it (data persists). Adding `-v` to that command
deletes the volume too - wipes all local data, use deliberately.

## Known limitations

- **Prisma Studio doesn't work with this setup** - `a.sort is not a
  function` when it tries to load schema metadata, a known upstream bug
  in Prisma Studio's interaction with the MariaDB driver adapter (Prisma
  issue #29280). The app itself works fine; use `phpMyAdmin` or a MySQL
  CLI/GUI client to browse data instead.
- **`max_connections_per_hour` (Hostinger, 500/hour default)** applies to
  the production database user. This counts new connections opened, not
  queries run - see the Docker section above for why local development
  should avoid touching Hostinger's database directly.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build/run |
| `npm run create-admin -- <email> <password>` | Bootstrap an admin account |
| `npm run db:up` / `npm run db:down` | Start/stop the local Docker MySQL |
| `npm run db:logs` | Tail the local MySQL container's logs |
# Accounts and progress

## Enable locally or in a deployment

Use Node.js 24. Accounts are optional; missing required configuration leaves the free guest experience enabled. There is no build-time database connection or automatic startup migration.

1. Create a dedicated PostgreSQL database (CI validates PostgreSQL 17).
2. Set `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `SMTP_URL`, and `EMAIL_FROM` in the server environment. `.env.example` documents these. Use the canonical HTTPS site origin for `BETTER_AUTH_URL`; HTTP is accepted only for localhost/127.0.0.1.
3. Generate the secret with `openssl rand -base64 48`. Never reuse the test secret. Store it in the hosting provider's secret manager.
4. Use a verified sender and an SMTP provider. `SMTP_URL` accepts `smtp://user:password@host:587` (STARTTLS required) or `smtps://user:password@host:465`. URL-encode username/password; extra query options are not supported. Only loopback SMTP permits unencrypted delivery for local tests. TLS certificate validation remains enabled.
5. Review `migrations/001_accounts.sql`, back up an existing database, then run `npm run db:migrate` against the intended database. The script loads a local `.env` if present. Hosting jobs can inject the environment directly.
6. Start the app and verify a real email link and progress on two devices before enabling public registration. No real production database, mailbox, or email delivery was configured during implementation.

Use a Node.js deployment; static export cannot serve these API routes. For database TLS, follow the provider's verified-certificate connection settings; do not disable certificate verification. The runtime pool is limited to five connections per process, so size the database/pooler for the number of app instances.

## Schema and migrations

The first SQL migration contains the Better Auth 1.7.4 core schema (`user`, `session`, `account`, `verification`, `rateLimit`) plus `learning_progress`. The auth schema was generated using Better Auth's migration planner with database rate-limit storage enabled. Although the standard account table has password/token columns, password and OAuth authentication are disabled.

`learning_progress` has a composite `(user_id, lesson_slug)` primary key, completion timestamp, and cascading user foreign key. Future migrations must be new numbered SQL files. Applied files are checksum-checked and must not be edited. The runner serializes migrations with a PostgreSQL advisory lock and applies each file in a transaction. Re-running is a no-op. Do not run the Better Auth CLI's direct migration command on an established production database outside this reviewed migration history.

## Authentication and deployment boundary

Better Auth's magic-link plugin handles registration, email ownership verification, token consumption, session cookies, origin checks, and sign-out. The app awaits SMTP delivery and gives a generic retry message on failure. No raw link, recipient, or credentials are logged by our handlers. The auth handler sends private/no-store and no-referrer headers. Configure reverse-proxy access logs and monitoring to redact auth query strings and cookies as well.

Database-backed rate limits run in all environments: five magic-link requests per minute per connecting IP, with the framework's general limits. Set `AUTH_IP_HEADER` to the **single header your trusted proxy overwrites** (default `x-real-ip`), and restrict access to the origin to that proxy. Without a reliable connecting IP, the framework's IP limiter cannot provide effective protection. Verify this in the target hosting environment; the app is not a substitute for ingress abuse controls.

The authenticated progress endpoint validates the session on every request. POST requires an exact canonical Origin, JSON content type, a body at most 8 KiB, and known lesson slugs. The client sends `expectedUserId` to detect account changes; it cannot choose which user's rows are written. Inserts only add completion, so repeats and simultaneous devices cannot erase progress.

## Guest import and save behavior

The original `dutchflow-progress-v1` value remains intact. Signing in starts from cloud progress. `/account` offers to add recognized guest completions missing from the account; the learner must choose this explicitly. Import never deletes cloud progress or the local guest copy.

Account progress is kept in React memory only. Signing out revokes that session and reloads the page; it does not sign out other devices. The original guest progress is visible again. Lesson completion requests are not queued offline. A failure shows a retry action before leaving the lesson; success is reflected in the progress list only after the server confirms it. Session lookup failures block saving until refreshed instead of silently writing to another storage location.

These are self-reported free lesson completion markers. They are not secure exam scores and must never be used for payment entitlements, certificates, or paid results.

## Tests and remaining launch work

`npm run test:e2e` uses a test-only launcher with an SMTP sink and private inbox bound to loopback. Local runs use ephemeral PGlite through the PostgreSQL protocol. CI supplies a disposable PostgreSQL 17 service via `TEST_DATABASE_URL`. Never set this variable to a real learner database. Tests exercise the real auth routes and emailed links; no test-login bypass or inbox API ships inside `src/app`.

Before public launch: configure and verify production SMTP and database backups, verify proxy IP handling and HTTPS cookies, add learner data export/deletion, publish privacy/contact information, and define data retention. Full payment/exam features remain separate future work.

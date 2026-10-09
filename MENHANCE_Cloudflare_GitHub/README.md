# MENHANCE — Cloudflare Pages + D1

GitHub-ready starter for the MENHANCE Korean consultation site and private admin list. Source only: it does not create Cloudflare resources or configure secrets automatically.

## Setup before collecting real data

1. In Cloudflare Dashboard, create a D1 database named `menhance-leads`.
2. Run `migrations/0001_create_leads.sql` in the D1 SQL Console.
3. In Pages project Settings > Bindings, add D1 binding named `LEADS_DB` pointing to that database.
4. In Pages Settings > Variables and Secrets, create encrypted Production secrets:
   - `ADMIN_PASSWORD`: unique strong administrator password.
   - `SESSION_SECRET`: cryptographically random secret of at least 32 random bytes.
   - `TURNSTILE_SECRET`: Turnstile Secret Key.
5. Create a Cloudflare Turnstile widget for your production hostname. Replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in `index.html` with the widget's Site Key. Store its Secret Key as `TURNSTILE_SECRET`.
6. Keep `index.html`, `admin/`, `functions/`, and `migrations/` at the Pages source root. For plain HTML, build command can be blank and output directory is usually `.`. Preserve existing build settings if your repo uses a framework; ensure the deployed Pages output includes the Functions directory.
7. Push to the connected GitHub branch and wait for a successful Cloudflare Pages deployment.

URLs: public site `https://YOUR-SITE.pages.dev/`; admin `https://YOUR-SITE.pages.dev/admin/`.

The admin list is read-only and returns up to 200 records. The form stores only topic, optional name, contact, preferred contact time, consent flag and timestamp; free-text medical details are not sent to the backend. Configure Cloudflare rate limiting for `/api/admin/login` and `/api/submit` before production. Publish a complete privacy notice (purpose, fields, retention, deletion, operator contact and processors/transfers) and test with dummy data first. This starter is not a security audit or legal compliance certification.

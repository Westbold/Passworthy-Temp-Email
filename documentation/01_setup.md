# Setup

This service is a Cloudflare Worker using Hono, Cloudflare Email Routing, D1, and Bun.
It stores email only for permanently claimed addresses. Attachments are ignored and are not stored.

## Prerequisites

- Bun
- A Cloudflare account with Workers, D1, and Email Routing access
- A domain configured in `src/config/domains.ts`
- Wrangler login access for the target Cloudflare account

## Install Dependencies

```bash
bun install
```

Log in to Cloudflare:

```bash
bun wrangler login
```

## Configure Cloudflare D1

Create the D1 database:

```bash
bun run db:create
```

Copy the generated `database_id` into `wrangler.jsonc` under the `D1` binding:

```jsonc
"d1_databases": [
  {
    "binding": "D1",
    "database_name": "temp-mail-d1",
    "database_id": "YOUR_DATABASE_ID"
  }
]
```

Apply the schema and indexes:

```bash
bun run db:tables
bun run db:indexes
```

The fresh-deploy schema creates:

- `emails`: stored email content for claimed addresses
- `claims`: permanent address ownership records keyed by email address

There is no attachment table and no R2 setup.

## Configure Email Routing

For each supported domain:

1. Open the domain in the Cloudflare dashboard.
2. Go to Email > Email Routing.
3. Enable Email Routing.
4. Create a catch-all rule.
5. Set the rule action to Send to Worker.
6. Select this Worker.

Inbound email is accepted only when the recipient address already has a claim. Email for
unclaimed addresses is discarded before parsing, storing, or webhook forwarding.

## Optional Telegram Logging

`wrangler.jsonc` contains:

```jsonc
"vars": {
  "TELEGRAM_LOG_ENABLE": true,
  "HOURS_TO_DELETE_D1": 3
}
```

For local development, add secrets to `.dev.vars`:

```text
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
```

For production, store them as Worker secrets:

```bash
bun wrangler secret put TELEGRAM_BOT_TOKEN
bun wrangler secret put TELEGRAM_CHAT_ID
```

## Optional Webhook Forwarding

Set both values to enable centralized webhook forwarding:

```bash
bun wrangler secret put WEBHOOK_URL
bun wrangler secret put WEBHOOK_SECRET
```

For local development:

```text
WEBHOOK_URL="https://example.com/webhooks/temp-mail"
WEBHOOK_SECRET="YOUR_SHARED_SECRET"
```

Webhook delivery is not controlled by per-address claims. Stored emails are forwarded to the
centralized webhook when both values are configured.

## Optional Cloudflare Information Script

Add Cloudflare API credentials to `.dev.vars`:

```text
CLOUDFLARE_ACCOUNT_ID="YOUR_CLOUDFLARE_ACCOUNT_ID"
CLOUDFLARE_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"
```

Run:

```bash
bun run cf-info
```

The token needs read access for the account resources being inspected, such as zones, Workers,
D1, and Email Routing.

## Local Development

Run the Worker locally through Wrangler:

```bash
bun run dev
```

This script uses `wrangler dev --remote`, so requests execute against Cloudflare remote
resources.

## Deploy

Deploy the Worker:

```bash
bun run deploy
```

View production logs:

```bash
bun run tail
```

## Claim an Address

After deployment, an address must be claimed before it can receive email:

```bash
curl -X PUT "https://YOUR_WORKER_HOST/claims/recipient@barid.site" \
  -H "Authorization: Bearer YOUR_CLAIM_KEY"
```

The same bearer key is required for every later email or inbox request for that recipient.
Claims are permanent until released.

Release a claim and delete all stored email for the address:

```bash
curl -X DELETE "https://YOUR_WORKER_HOST/claims/recipient@barid.site" \
  -H "Authorization: Bearer YOUR_CLAIM_KEY"
```

## Supported Scripts

```bash
bun run dev
bun run deploy
bun run tail
bun run db:create
bun run db:tables
bun run db:indexes
bun run cf-info
bun run cf-typegen
bun run check
bun run lint
bun run lint:fix
bun run format
bun run tsc
bun run knip
```

# Testing

This repo uses Bun for tests, Biome for formatting and linting, and TypeScript for type checks.

## Install Test Dependencies

```bash
bun install
```

## Run All Tests

```bash
bun test
```

Current tests cover:

- Claim authorization header parsing and key hashing
- Webhook body serialization and HMAC-SHA512 signature format
- Claim route behavior, including idempotent claims and conflict rejection
- Protected inbox access with matching and mismatched bearer keys
- Claim release deleting stored address email data
- Inbound unclaimed email discard before parsing or webhook delivery

## Run Targeted Tests

```bash
bun test src/utils/auth.test.ts
bun test src/utils/webhook.test.ts
bun test src/routes/emailRoutes.test.ts
bun test src/handlers/emailHandler.test.ts
```

Run the critical access-control and webhook tests together:

```bash
bun test \
  src/utils/auth.test.ts \
  src/utils/webhook.test.ts \
  src/routes/emailRoutes.test.ts \
  src/handlers/emailHandler.test.ts
```

## Static Checks

Run Biome checks:

```bash
bun run check
```

Run TypeScript without emitting files:

```bash
bun run tsc
```

Format source files:

```bash
bun run format
```

Run the full practical verification set:

```bash
bun run check
bun run tsc
bun test
git diff --check
```

## Knip

The repo includes a Knip script:

```bash
bun run knip
```

At the time this documentation was written, Knip is not configured to treat Bun test files as
entry points, so it may report test files and test-only exports as unused. Use `bun run check`,
`bun run tsc`, and `bun test` as the primary verification suite unless Knip configuration is
updated.

## Manual API Smoke Test

After a local or deployed Worker is available, set:

```bash
export API_BASE="https://YOUR_WORKER_HOST"
export CLAIM_KEY="local-test-secret"
export ADDRESS="recipient@barid.site"
```

On PowerShell:

```powershell
$env:API_BASE = "https://YOUR_WORKER_HOST"
$env:CLAIM_KEY = "local-test-secret"
$env:ADDRESS = "recipient@barid.site"
```

Claim the address:

```bash
curl -X PUT "$API_BASE/claims/$ADDRESS" \
  -H "Authorization: Bearer $CLAIM_KEY"
```

Check the inbox:

```bash
curl "$API_BASE/emails/$ADDRESS" \
  -H "Authorization: Bearer $CLAIM_KEY"
```

Verify mismatched keys are denied:

```bash
curl "$API_BASE/emails/$ADDRESS" \
  -H "Authorization: Bearer wrong-key"
```

Release the claim:

```bash
curl -X DELETE "$API_BASE/claims/$ADDRESS" \
  -H "Authorization: Bearer $CLAIM_KEY"
```

## Webhook Signature Test Vector

The webhook helper test verifies this exact body:

```json
{"id":"email_1","from_address":"sender@example.com","to_address":"inbox@barid.site","subject":"Hello","received_at":1753317948,"html_content":"<p>Hello</p>","text_content":"Hello"}
```

With secret `top-secret`, the expected header is:

```text
X-Webhook-Signature: HMAC-SHA512=9VAQx2i2p4oJbVYCofgUF0IcVqZjqB3OvAZKPW8dLxWmQr+bzEaWAK8tst0+IAGUK4IIp2S8hMB+fpaxyRPUXQ==
```

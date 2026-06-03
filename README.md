# Temp Mail Worker

Cloudflare Worker that acts as a temporary email inbox.

**API documentation:** [https://api.driftz.net](https://api.driftz.net)

AI-made web client: [https://driftz.net](https://driftz.net)

## Table of Contents

*   [Features](#features)
*   [Supporters](#supporters)
*   [Community](#community-built-stuff)
*   [Setup Guide](#setup-guide)
    *   [Prerequisites](#prerequisites)
    *   [Project Setup](#project-setup)
    *   [Cloudflare Configuration](#cloudflare-configuration)
        *   [D1 Database Setup](#d1-database-setup)
        *   [Email Routing Setup](#email-routing-setup)
*   [Running the Worker](#running-the-worker)
    *   [Cloudflare Information Script (Optional)](#cloudflare-information-script-optional)
    *   [Telegram Logging (Optional)](#telegram-logging-optional)
    *   [Address Claims and Authorization](#address-claims-and-authorization)
    *   [Webhook Forwarding (Optional)](#webhook-forwarding-optional)
    *   [Local Development](#local-development)
    *   [Deployment](#deployment)

---

## Features

*   Receives emails via Cloudflare Email Routing.
*   Stores email data in a Cloudflare D1 database.
*   Lets users permanently claim supported email addresses with a bearer key.
*   Discards inbound email for unclaimed addresses.
*   Provides authorized API endpoints for email inbox management.
*   Optionally forwards stored emails to a signed centralized webhook.
*   Automatically cleans up old emails.
*   Ignores incoming email attachments.

## Supporters

A big thank you to individuals who have donated domains to support this project. Your contributions help keep this service running.

| Domain | Donated by |
| --- | --- |
| `barid.site` | [vwh](https://github.com/vwh) |
| `vwh.sh` | [vwh](https://github.com/vwh) |
| `iusearch.lol` | [vwh](https://github.com/vwh) |
| `lifetalk.us` | [mm6x](https://github.com/mm6x) |
| `z44d.pro` | [z44d](https://github.com/z44d) |
| `wael.fun` | [blockton](https://github.com/blockton) |
| `tawbah.site` | [HprideH](https://github.com/HprideH) |
| `kuruptd.ink` | [HprideH](https://github.com/HprideH) |
| `oxno1.space` | [oxno1](https://github.com/oxno1) |
| `hacktivc.com` | None |
| `lealaom.xyz` | None |
| `leala.site` | None |

### How to Donate a Domain

If you have an unused domain and would like to contribute, you can donate it by following these steps:

1.  **Create a Pull Request**: Add your domain and owner information to `config/domains.ts` file in `src` directory.
2.  **Nameserver Provisioning**: After your pull request, we will provide you with nameservers to update for your domain.

---

## Community

Here are some projects built by the community using or integrating with Temp Mail Worker:

*   **Rust Library**: [doomed-neko/tmapi](https://github.com/doomed-neko/tmapi/)
*   **Go Library**: [blockton/barid](https://github.com/blockton/barid)
*   **Python Library**: [superhexa/barid-client](https://github.com/superhexa/barid-client)
*   **CLI App**: [doomed-neko/tmcli](https://github.com/doomed-neko/tmcli)

---

## Setup Guide

### Prerequisites

Before you begin, ensure you have following:

*   **Bun**: Installed on your system.
*   **Cloudflare Account**: With access to Workers, Email Routing, and D1.

### Project Setup

1.  **Install Dependencies**: Install necessary JavaScript dependencies.
    ```bash
    bun install
    ```

2.  **Login to Cloudflare**: You need to log in to your Cloudflare account via Wrangler. This will open a browser for authentication.
    ```bash
    bun wrangler login
    ```

### Cloudflare Configuration

#### D1 Database Setup

1.  **Create** D1 database**:
    ```bash
    bun run db:create
    ```
2.  **Copy** `database_id`: From output of above command.
3.  **Update** `wrangler.jsonc`: Open `wrangler.jsonc` and replace `database_id` with `database_id` you just copied.
4.  **Apply Database Schema**:
    ```bash
    bun run db:tables
    ```
5.  **Apply Database Indexes**:
    ```bash
    bun run db:indexes
    ```

#### Email Routing Setup

1.  **Go to your Cloudflare Dashboard**: Select your domain (`example.com`).
2.  **Navigate to "Email" -> "Email Routing"**.
3.  **Enable Email Routing** if it's not already enabled.
4.  **Create a Catch-all Rule**:
    *   For "Action", choose "Send to Worker".
    *   Select your Worker (e.g., `temp-mail`).
    *   Click "Save".

## Running the Worker

### Cloudflare Information Script (Optional)

To check your Cloudflare Workers, D1 databases, and domain information directly from your terminal, you can use the `cf-info` script.

1.  **Configure API Credentials**: Add your Cloudflare Account ID and an API Token with appropriate permissions (e.g., `Zone:Read`, `Worker Scripts:Read`, `D1:Read`, `Zone:Email:Read`) to your `.dev.vars` file.

    Example `.dev.vars` additions:
    ```
    CLOUDFLARE_ACCOUNT_ID="YOUR_CLOUDFLARE_ACCOUNT_ID"
    CLOUDFLARE_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"
    ```

2.  **Run** Script**:
    ```bash
    bun run cf-info
    ```

### Telegram Logging (Optional)

If you wish to enable Telegram logging for your worker, follow these steps:

1.  **Enable Logging in `wrangler.jsonc`**: Ensure `TELEGRAM_LOG_ENABLE` is set to `true` in your `wrangler.jsonc` file under `vars` section.

2.  **Local Development (`.dev.vars`)**: For local development, create a `.dev.vars` file in your project root with your Telegram bot token and chat ID. This file is used by `bun dev`.

    Example `.dev.vars`:
    ```
    TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
    TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
    ```

3.  **Production Deployment (Secrets)**: For production, you must set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as secrets using `wrangler`. This securely stores your sensitive information with Cloudflare.

    Run following commands in your terminal and enter respective values when prompted:
    ```bash
    bun wrangler secret put TELEGRAM_BOT_TOKEN
    bun wrangler secret put TELEGRAM_CHAT_ID
    ```

### Address Claims and Authorization

Users must claim an address before it can receive email. The claim key is supplied as a bearer token:

```text
Authorization: Bearer YOUR_CLAIM_KEY
```

Claim an address:

```http
PUT /claims/recipient@barid.site
Authorization: Bearer YOUR_CLAIM_KEY
```

Claims are permanent and do not expire. Calling the same claim endpoint again with the same bearer token is idempotent. Calling it with a different bearer token returns `409 Conflict`.

All email and inbox endpoints require the same bearer token that claimed the recipient address. Requests with a missing token, unclaimed address, or mismatched token are denied.

Release a claim and delete all stored email for that address:

```http
DELETE /claims/recipient@barid.site
Authorization: Bearer YOUR_CLAIM_KEY
```

Inbound email for unclaimed addresses is discarded and is not stored or forwarded to the webhook. Webhook delivery is centralized and does not use per-address claim authorization.

### Webhook Forwarding (Optional)

Set `WEBHOOK_URL` and `WEBHOOK_SECRET` to forward every stored email to an external webhook. If either value is missing, webhook forwarding is disabled.

For production, set both values as Worker secrets:

```bash
bun wrangler secret put WEBHOOK_URL
bun wrangler secret put WEBHOOK_SECRET
```

For local development, add them to `.dev.vars`:

```text
WEBHOOK_URL="https://example.com/webhooks/temp-mail"
WEBHOOK_SECRET="YOUR_SHARED_SECRET"
```

The Worker sends a `POST` request with `Content-Type: application/json` and this header:

```text
X-Webhook-Signature: HMAC-SHA512=<base64_hmac_sha512_of_body>
```

The signature is computed over the exact UTF-8 request body using `WEBHOOK_SECRET`. Webhook failures are logged but do not reject or delete the received email.

Webhook body shape:

```json
{
  "id": "usm2sw0qfv9a5ku9z4xmh8og",
  "from_address": "sender@example.com",
  "to_address": "recipient@barid.site",
  "subject": "Welcome to our service",
  "received_at": 1753317948,
  "html_content": "<p>Hello world</p>",
  "text_content": "Hello world"
}
```

### Local Development

To run worker locally:

```bash
bun run dev
```

### Deployment

To deploy your worker to Cloudflare:

```bash
bun run deploy
```

## Available Scripts

### Development & Deployment
- `bun run dev` - Start local development server
- `bun run deploy` - Deploy to Cloudflare Workers
- `bun run tail` - View live logs from deployed worker

### Database Management
- `bun run db:create` - Create D1 database
- `bun run db:tables` - Apply database schema
- `bun run db:indexes` - Apply database indexes

### Code Quality
- `bun run check` - Run Biome checks
- `bun run lint` - Run Biome linting
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code with Biome
- `bun run tsc` - Run TypeScript compiler

### Utilities
- `bun run cf-info` - Display Cloudflare account information
- `bun run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## API Endpoints

### Email Endpoints

- `PUT /claims/{emailAddress}` - Permanently claim a supported address with `Authorization: Bearer <key>`
- `DELETE /claims/{emailAddress}` - Release a claim and delete all stored email for that address
- `GET /emails/{emailAddress}` - Get emails for a claimed address
- `GET /emails/count/{emailAddress}` - Get email count for a claimed address
- `GET /inbox/{emailId}` - Get a specific email by ID
- `DELETE /emails/{emailAddress}` - Delete all emails for a claimed address
- `DELETE /inbox/{emailId}` - Delete a specific email by ID
- `GET /domains` - Get list of supported domains

All claim, email, and inbox endpoints require `Authorization: Bearer <key>`. `/domains` and `/health` are public.

### Health Check

- `GET /health` - Service health status

For complete API documentation with examples, visit: [https://api.barid.site](https://api.barid.site)

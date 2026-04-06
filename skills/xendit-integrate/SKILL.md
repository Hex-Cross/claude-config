---
name: xendit-integrate
description: Xendit payment gateway — VA, e-wallets, QRIS, subscriptions, webhook verification for Indonesian apps
user-invocable: true
version: 1.0.0
---

# Xendit Integrate — Payment Gateway

## Step 1: Detect Stack and Init

Read `package.json` for framework. Install Xendit SDK if needed: `npm install xendit-node`.
Generate API client initialization with env vars: `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`.

## Step 2: Generate Payment Method Handlers

Create modules for each Indonesian payment method:

**Virtual Account (Bank Transfer)**
- BCA, BNI, BRI, Mandiri, Permata
- Create VA → wait for payment → webhook notification

**E-Wallets**
- GoPay, OVO, Dana, ShopeePay, LinkAja
- Create charge → redirect to app → webhook callback

**QRIS**
- Generate QR code via Xendit API
- Static or dynamic QRIS
- Webhook on scan+pay

**Credit/Debit Card**
- Tokenization flow
- 3DS authentication
- Charge with saved token

## Step 3: Generate Webhook Handler

Create a secure webhook endpoint:
- Verify `x-callback-token` header against `XENDIT_WEBHOOK_TOKEN`
- Parse webhook event types: `invoice.paid`, `ewallet.charge.completed`, `va.payment`, `qr.payment`
- Idempotency: check `external_id` to prevent duplicate processing
- Update order/payment status in database
- Return 200 immediately, process async

## Step 4: Generate Subscription/Recurring Billing

For SaaS billing (PatuhIn, Niaga):
- Create recurring plan with Xendit
- Customer subscription lifecycle: create → charge → renew → cancel
- Grace period handling for failed payments
- Proration for plan changes
- Invoice generation with Indonesian tax (PPN 12%)

## Step 5: Generate Invoice Pattern

Create invoice creation flow:
- Multi-payment-method invoice (customer chooses how to pay)
- Expiry handling
- Reminder notifications (connect to WhatsApp flow)
- PDF invoice generation with Indonesian format

## Step 6: Idempotency and Error Handling

Generate patterns for:
- Idempotency keys on all payment creation requests
- Retry logic with exponential backoff
- Timeout handling (Xendit webhooks may delay)
- Reconciliation job to catch missed webhooks

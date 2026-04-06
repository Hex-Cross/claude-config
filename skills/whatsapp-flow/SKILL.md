---
name: whatsapp-flow
description: WhatsApp Business Cloud API integration — webhook handlers, Bahasa Indonesia templates, conversation flows for Indonesian SMEs
user-invocable: true
version: 1.0.0
---

# WhatsApp Flow — Business API Integration

## Step 1: Detect Stack

Read `package.json` to identify framework (Next.js, Express, Hono, etc.) and existing dependencies. Check for existing WhatsApp SDK packages.

## Step 2: Generate Webhook Handler

Generate a webhook verification endpoint (GET) and message receiver (POST):
- Verify `hub.verify_token` against env var `WHATSAPP_VERIFY_TOKEN`
- Parse incoming messages, status updates, and interactive replies
- Validate `X-Hub-Signature-256` header for request authenticity
- Return 200 quickly, process async

## Step 3: Generate Message Sender

Create a utility module for sending messages via WhatsApp Cloud API:
- Text messages
- Template messages (pre-approved by Meta)
- Interactive messages (buttons, lists)
- Media messages (images, documents, PDFs)
- Use env vars: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`

## Step 4: Generate Bahasa Indonesia Templates

Create message template definitions for common Indonesian SME flows:
- **Konfirmasi Pesanan** — order confirmation with details
- **Pengingat Pembayaran** — payment reminder with due date and QRIS link
- **Peringatan Kadaluarsa** — certificate/license expiry alert
- **Jadwal Janji** — appointment booking confirmation
- **Status Pengiriman** — shipping/delivery status update
- **Faktur Pajak** — tax invoice notification

Each template follows Meta's required format with header, body, footer, and button components.

## Step 5: Generate Conversation State Machine

Create a conversation flow handler:
- Track conversation state per phone number (in-memory or Redis)
- Handle multi-step flows (e.g., order → confirm → payment → receipt)
- Timeout handling for abandoned conversations
- Handoff to human agent pattern

## Step 6: QRIS Payment Integration

Generate a pattern for embedding QRIS payment links in WhatsApp messages:
- Generate QRIS via Xendit or other provider
- Send as image attachment with payment instructions
- Listen for payment webhook and send confirmation via WhatsApp

## Step 7: Meta Policy Compliance Check

Validate against Meta 2026 bot policy:
- Messages must serve concrete business tasks (not marketing spam)
- 24-hour messaging window rules
- Template pre-approval requirements
- Opt-in/opt-out handling

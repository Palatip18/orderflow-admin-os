# Sprint 1A — LINE Reply-only Alpha Plan

## Goal
Implement a real LINE Messaging API webhook in Alpha Mode to process incoming customer messages, map them using rule-based NLP intent parsing, reply to the customer immediately in Thai, and record the events in a live-updated console dashboard.

## Architectural Scope
- **Channel Scope**: Connect LINE only. All other channels remain simulated.
- **Reply-only Restriction**: Uses the `replyToken` exclusively. No push, broadcast, multicast, or narrowcast messages are implemented to maintain zero API cost.
- **Signature Verification**: Validates `x-line-signature` against the HMAC-SHA256 of the raw body using `crypto` in the Node.js runtime.
- **In-Memory Storage**: Uses a thread-safe singleton store (`serverSimulationStore.ts`) to cache live messages, orders, and events. No database connection is introduced in this phase.
- **Localization**: Maintains Thai-first customer-facing replies while preserving English coding identifiers.

## Data Stream Pipeline
```
Customer Text (LINE) 
       │
       ▼
Next.js App Webhook Handler (`/api/line/webhook`)
       │ ── (Verify x-line-signature using raw text body)
       ▼
Intent Parsing (`lineMessageMapper.ts`) ── (Match SKU, variants, address, slip)
       │
       ▼
Create / Update Order State ── (Store in-memory via `serverSimulationStore.ts`)
       │
       ▼
Generate Reply Message (Thai-first response template)
       │
       ▼
LINE Messaging Reply API ── (Immediate feedback to the customer)
```

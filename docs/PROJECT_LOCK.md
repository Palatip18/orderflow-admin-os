# Project Lock: OrderFlow Admin OS

This document details the core product boundaries, user profiles, current limitations, and future upgrade path for the **OrderFlow Admin OS** portfolio MVP.

---

## 1. What the System Is
* A **commercial-ready portfolio MVP** that demonstrates the design system and data modeling for omni-channel conversational sales order administration.
* An **automated order intake state machine concept** that manages product variants checking, stock reservations, payment confirmations, and logistics dispatch status.
* A **unified merchant operations dashboard** that calculates key business metrics (revenue, outstanding balances, logistics statuses) dynamically from structured datasets.
* A **decoupled system architecture design** featuring channel adapters, an inbox parser boundary, and rule-driven backend state controllers.

## 2. What the System Is NOT
* **NOT an e-commerce storefront**: It does not host public-facing catalogs or web checkout flows.
* **NOT a production SaaS platform yet**: It lacks multi-tenant isolation, user authentication, live databases, and subscription tiers in Sprint 0A.
* **NOT a bank-integrated system**: It does not link with payment gateways or run live banking APIs (all validations are mock workflows).
* **NOT a fully autonomous decision engine**: AI is restricted to data extraction only; final inventory reserves and payment approvals are guided by deterministic logic rules and human oversight.

---

## 3. Target Users
* **Thai Social Sellers & Live Streamers**: Merchants selling products on Facebook Live, TikTok Live, LINE OA, and Instagram who experience high message volumes and need automated back-office support.
* **Warehouse & Logistics Admins**: Team members who need to see a clean "Ready to Ship" queue with address parameters and shipping labels generator outputs.

---

## 4. Current Sprint Limitations (Sprint 0A)
* **Storage**: In-memory variables and simulation state only. No Postgres database connectivity.
* **APIs**: All webhook connections (LINE OA API, Facebook Graph API, Instagram API) are simulated using local mocks.
* **NLP Parser**: Regex mapping simulates NLP extraction scores in the inbox views.
* **Slip verification**: Slip verification status transitions are triggered manually via UI demo buttons instead of SlipOK webhook callbacks.

---

## 5. Commercial SaaS Upgrade Path
1. **Relational Sync**: Connect PostgreSQL schemas, converting local JS arrays into active SQL queries.
2. **Channel Webhook Ingestion**: Secure LINE OA and Facebook webhook endpoints, implementing message queuing for high traffic.
3. **SlipOK Integration**: Activate OCR/QR checking modules to match bank codes against order transaction values.
4. **Tenant Isolation**: Add authentication (NextAuth/Auth.js) and database-level merchant partitioning.

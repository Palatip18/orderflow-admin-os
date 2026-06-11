# OrderFlow Admin OS

A commercial-ready portfolio MVP for 24/7 omni-channel order administration automation tailored for Thai online sellers and live broadcasters.

---

## 1. Project Positioning & Purpose

**OrderFlow Admin OS** is a **scalable product concept** and **upgrade-ready architecture** designed to solve back-office admin fatigue. In social commerce channels (LINE OA, Facebook, Instagram, TikTok), merchants often struggle with high message volumes, tracking stock holds, verifying payments slips, and capturing shipping addresses.

This system demonstrates a decoupled, state-driven console dashboard that normalizes incoming customer messages, parses order intent, executes automatic inventory reservations, verifies payments, and coordinates shipments under strict deterministic rules.

* **Disclaimer**: This is a **portfolio MVP**. It is **NOT** a launched production SaaS, has no live database connection, and processes no real money or live LINE/Facebook API keys. All channels, slip checking, and NLP pipelines are simulated using **mock channel adapters** and rule-based workflow pipelines.

---

## 2. Key Features (Sprint 0A)

1. **Omni-Channel Inbox Simulator**: Review incoming customer messages simulating LINE OA, Facebook Messenger, Facebook Live comments, Instagram DMs, and TikTok Live comments.
2. **AI-Assisted Parsing Mockup**: Visual layout showing parsed parameters (colors, sizes, quantities, bank slip reference codes, shipping address blocks) alongside NLP confidence tags.
3. **Live Operations Dashboard**: High-fidelity UI cards tracking real-time total sales volumes, collected revenues, outstanding balances, pending issues count, and log streams.
4. **Interactive Orders & Stock Manager**: Real-time table of order statuses with manual status-override controls (e.g. simulating a successful SlipOK payment match).
5. **Product & Variants Matrix**: Visualizes SKU-level stocks including reserved buffers and completed sales.
6. **SQL-Ready Database Architecture**: PostgreSQL draft tables schema and Business Analyst queries mapping customers, payments, stock movements, and audit log histories.

---

## 3. Tech Stack

* **Core Framework**: Next.js 16 (App Router)
* **View Engine**: React 19
* **Type System**: TypeScript 5
* **Styling**: Tailwind CSS 4
* **State Management**: React State / LocalStorage-ready architecture
* **Data Model**: PostgreSQL (14 structural tables design)

---

## 4. Current Limits & Safe boundaries

* **No Production SaaS Claims**: Lacks multi-tenant auth, workspace separation, and subscription plans.
* **Simulated Webhooks**: All channel webhooks are mock lists in `lib/mockData.ts`.
* **Slip verification**: Bank scans are simulated. In this sprint, you can trigger confirmation transitions using the manual mock buttons in the Orders detail card.
* **Responsible AI Bound**: Intent parsing acts as an advisor. The state-machine forces deterministic code matches and human approval logs before altering final database items or shipping records.

---

## 5. How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch the Development Server
```bash
npm run dev
```

### 3. Open the Dashboard
Navigate to [http://localhost:3000](http://localhost:3000) on your local browser.

---

## 6. Project Directory Layout

* `types/orderflow.ts` - Shared domain models and TypeScript interfaces.
* `lib/mockData.ts` - Fashion catalog and customer message lists.
* `lib/dashboardMetrics.ts` - Logic aggregating sales amounts and order status numbers.
* `lib/orderStatusRules.ts` - Order payment validations and state transition loops.
* `lib/statusLabels.ts` - Styling maps for UI badges.
* `docs/PROJECT_LOCK.md` - Core project boundaries and personas.
* `docs/database/schema.sql` - PostgreSQL database structure script.
* `docs/database/sample_queries.sql` - Standard business intelligence reporting scripts.

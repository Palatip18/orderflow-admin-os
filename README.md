# OrderFlow Admin OS

A commercial-ready portfolio MVP for 24/7 omni-channel order administration automation tailored for Thai online sellers and live broadcasters.

---

## 1. Project Positioning & Purpose

**OrderFlow Admin OS** is a **commercial-ready portfolio MVP** and **upgrade-ready architecture** demonstrating a simulated live dashboard and order intake flow. It is designed to demonstrate how back-office workflows can be structured and decoupled to solve admin fatigue for Thai online sellers.

This system demonstrates a decoupled, state-driven portfolio dashboard UI, simulated channel adapters, local mock data calculations, and simulated stock reservation logic.

> [!WARNING]
> **Important Portfolio MVP & Wording Safety Notice**:
> - **Simulated Dashboard**: All calculations, totals, and counts displayed on the dashboard are computed from local mock data and browser-local simulation state.
> - **Mock Verification**: Payment and bank slip verification is completely mock/simulated. No real SlipOK or banking API connection exists.
> - **Manual Demo Controls**: Order status shifts and verification loops are controlled manually via simulation buttons in the order details screen for Sprint 0A demo purposes.
> - **No Active Integrations**: No real customer messages are processed, and no live connections or webhooks exist for LINE OA, Facebook Messenger, Facebook Live, TikTok Live, or Instagram.
> - **No Production SaaS Claims**: This is a portfolio concept only. There is no user authentication, database integration, or billing setup.

---

## 2. Key Features (Sprint 0A)

1. **Omni-Channel Inbox Simulator**: Review incoming customer messages simulating LINE OA, Facebook Messenger, Facebook Live comments, Instagram DMs, and TikTok Live comments.
2. **AI-Assisted Parsing Mockup**: Visual layout showing parsed parameters (colors, sizes, quantities, bank slip reference codes, shipping address blocks) alongside NLP confidence tags.
3. **Live Operations Dashboard**: Portfolio dashboard UI cards showing simulated live sales totals, collected revenue, outstanding balances, pending issue counts, and event log streams calculated from mock data.
4. **Interactive Orders & Stock Manager**: Mock order status table with manual Sprint 0A simulation controls.
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

## 5. Sprint 0B — Core Order Lifecycle Simulator

* **Interactive Order Lifecycle Demo**: Navigate to `/simulator` to play through a step-by-step order lifecycle sequence.
* **Simulated Incoming Order**: Choose preset customer messages (e.g. "CF A001 ขาว S") or write custom inputs.
* **Mock Stock Check**: Matches codes against mock product database SKUs (`A001`, `B002`, `C003`).
* **Mock Variant Confirmation**: Prompts and simulates customer color/size options specifications.
* **Mock Payment Verification**: Simulate SlipOK banking OCR scanning with multiple options (Valid, Mismatch, Duplicate).
* **Mock Address Collection**: Collects shipping blocks without bypassing payment requirements.
* **Ready-to-Ship Queue**: Automatically transitions orders to logistics queues once payment and address inputs are validated.
* **Automation Logic**: After mock payment verification and address collection, the simulator automatically moves the order to ready-to-ship to reflect the intended automation logic.
* **Mock Tracking Capture**: Dispatches orders to couriers with mock tracking codes.
* **State Synchronization**: Live dashboard metrics, orders queue, and notification centers update immediately from simulated localStorage state.
* **Local Simulation State**: Simulator-generated incoming messages, orders, events, and notifications are stored in browser-local simulation state and rendered across Inbox, Orders, Dashboard, and Notifications.

---

## 6. How to Run Locally

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

## 7. Project Directory Layout

* `types/orderflow.ts` - Shared domain models and TypeScript interfaces.
* `lib/mockData.ts` - Fashion catalog and customer message lists.
* `lib/dashboardMetrics.ts` - Logic aggregating sales amounts and order status numbers.
* `lib/orderStatusRules.ts` - Order payment validations and state transition loops.
* `lib/statusLabels.ts` - Styling maps for UI badges.
* `lib/localOrderState.ts` - localStorage accessors for simulator syncs.
* `lib/orderLifecycleSimulator.ts` - Parser rules and lifecycle state triggers.
* `docs/PROJECT_LOCK.md` - Core project boundaries and personas.
* `docs/database/schema.sql` - PostgreSQL database structure script.
* `docs/database/sample_queries.sql` - Standard business intelligence reporting scripts.


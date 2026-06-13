# 01 — SDLC Mapping

> **QA/UAT Learning Capstone — OrderFlow Admin OS**
> Document purpose: Understand the Software Development Lifecycle (SDLC) and map each phase to QA responsibilities, OrderFlow examples, and Ray's existing operations background.

---

## What Is the SDLC?

The **Software Development Lifecycle (SDLC)** is a structured process that software teams follow to plan, build, test, and maintain software. It ensures that software is delivered with known quality, on a predictable schedule, with documented requirements.

Different teams use different SDLC models:
- **Waterfall** — sequential phases, each completed before the next begins
- **Agile / Scrum** — iterative sprints, continuous delivery and testing
- **V-Model** — testing planned in parallel with each development phase

In this capstone, we follow a **Sprint-based Agile approach** (because OrderFlow was built in sprints: Sprint 0A, 0B, 1A). However, all SDLC phases still apply — they just run in shorter cycles.

> **Interview tip:** You do not need to memorise every SDLC model. What interviewers want to know is: *Do you understand that software goes through phases, and do you know where QA fits in each phase?*

---

## SDLC Phases — Overview Table

| # | Phase | What happens | QA involvement |
|---|---|---|---|
| 1 | Planning | Project goals, scope, resources, timeline | Review scope, flag risks early |
| 2 | Requirement Analysis | What the system should do (features, business rules) | Understand requirements, write acceptance criteria |
| 3 | Design | How the system will be built (architecture, UI, flows) | Review designs for testability |
| 4 | Implementation | Developers write the code | Write test cases in parallel, prepare test data |
| 5 | Testing & Integration | Test the system against requirements | Execute test cases, report defects, validate fixes |
| 6 | Maintenance | Bug fixes, improvements after release | Regression testing, monitor for new defects |

---

## Phase 1 — Planning

### What happens in this phase?
The team defines:
- **What the product is** and what problem it solves
- **Who the users are** (merchants, operations staff, developers)
- **What is in scope** and what is explicitly out of scope
- **Timeline and resources**
- **Risks and constraints**

### OrderFlow Example
In OrderFlow, Sprint 0A was the planning phase where the scope was defined as:

> *"Build a portfolio MVP simulating a Thai online seller order administration workflow — inbox, orders, dashboard, simulator, and notifications."*

Key decisions made:
- No real database (localStorage/in-memory only)
- No real payments
- No real LINE/Facebook integration yet (Sprint 0A/0B)
- Simulator replaces real channel events for demo purposes

The scope also explicitly excluded: auth/login, real API integrations, production SaaS claims.

### QA Responsibility in Planning
- Understand the scope early so you know what needs to be tested
- Identify **out of scope** items so you don't waste effort testing things that aren't part of the release
- Flag risks: *"If there's no database, what happens to data on server restart?"* (This was a real risk in OrderFlow — in-memory state resets.)
- Begin thinking about what types of tests will be needed

### Risk / Quality Focus
- Risk of scope creep (adding features mid-sprint without proper testing)
- Risk of ambiguous requirements leading to untestable features
- Risk of no clear acceptance criteria

### Connection to My Operations Background
> In payment/risk operations, before reviewing a batch of transactions, I always checked the scope: *Which transaction types are we reviewing? What's the cutoff date? Which team is responsible for escalations?* This is the same discipline — define scope before you start work, so you don't waste effort or miss something important.

---

## Phase 2 — Requirement Analysis

### What happens in this phase?
The team documents:
- **Business requirements** — what the business needs the system to do
- **Functional requirements** — specific system behaviour (if X, then Y)
- **Non-functional requirements** — performance, security, reliability
- **User stories** — requirements written from the user's perspective
- **Acceptance criteria** — how we know a requirement is met

### OrderFlow Example

**Business requirement:**
> "When a customer sends a product inquiry via LINE, the merchant should be able to see the message, identify the product, and create an order."

**Functional requirement:**
> "The system shall parse the customer's message for product ID, colour, and size. If all three are provided, it shall create an order in `reserved_waiting_payment` status."

**Acceptance criteria (Sprint 1A):**
> - Given: a customer sends "สนใจกางเกงช้างครับ A001" via LINE
> - When: the webhook processes the message
> - Then: the system replies asking for colour and size; after colour/size are received, an order is created and a payment instruction is sent

### QA Responsibility in Requirement Analysis
- Read requirements carefully and flag anything **ambiguous or missing**
- Write or review **acceptance criteria** for each requirement
- Ask: *"What happens if the customer sends an invalid product ID? What if colour is missing?"*
- Identify **edge cases** early (partial data, wrong format, duplicate orders)
- Ensure requirements are **testable** — if you can't write a test case for it, the requirement is too vague

### Risk / Quality Focus
- Missing requirements lead to missing test cases — defects slip through
- Ambiguous requirements lead to disagreements between developers and QA about what "correct" behaviour looks like
- Non-functional requirements (response time, error handling) are often forgotten

### Connection to My Operations Background
> In customer operations, before handling a case type, I always reviewed the process document: *What are the rules? What are the exceptions? What's the escalation path?* Requirements analysis in QA is the same — understand the rules before you start, so you know what "correct" looks like when you're testing.

---

## Phase 3 — Design

### What happens in this phase?
The team creates:
- **System architecture** — how components are connected
- **UI/UX wireframes or designs** — what screens look like
- **Data models** — how data is structured
- **Flow diagrams** — how users move through the system
- **API design** — how the system communicates internally and externally

### OrderFlow Example

OrderFlow's architecture was designed as:
- **Next.js frontend** (pages: `/inbox`, `/orders`, `/dashboard`, `/simulator`, `/notifications`)
- **API routes** (`/api/line/webhook`, `/api/simulation/server-state`, `/api/settings/config-status`)
- **In-memory server state** (`lib/serverSimulationStore.ts`) + **localStorage** (`lib/localOrderState.ts`)
- **LINE Messaging API** webhook for alpha integration

The order lifecycle flow was designed as:
```
Customer message → Intent parsed → Order created (reserved_waiting_payment)
→ Payment instruction sent → Payment confirmed (paid_waiting_address)
→ Address collected (ready_to_ship) → Tracking added (shipped)
```

### QA Responsibility in Design
- Review designs for **testability** — can we actually verify this behaviour?
- Identify **integration points** that need testing (webhook → parser → order creation → LINE reply)
- Flag potential **edge cases** in the design (what if the webhook fires twice with the same message?)
- Begin **drafting test cases** based on the flow diagrams
- Confirm that error paths are designed (not just the happy path)

### Risk / Quality Focus
- Designs that don't account for error states are hard to test and produce fragile systems
- Integration points (LINE API → webhook → state → UI) are common defect locations
- In-memory state with no persistence is a reliability risk — documented as known limitation

### Connection to My Operations Background
> When my team designed a new refund workflow, I always asked: *"What happens if the customer re-submits while the first request is still processing? What's the error message? Who gets notified?"* This is design review thinking — the same skill QA uses to catch gaps before code is written.

---

## Phase 4 — Implementation

### What happens in this phase?
Developers:
- Write the application code
- Fix bugs found during development
- Integrate components and APIs
- Conduct code reviews

### OrderFlow Example

Key implementation work done in OrderFlow sprints:

| Sprint | Key implementation |
|---|---|
| Sprint 0A | Mock data, order lifecycle UI, simulator, dashboard, inbox, notifications |
| Sprint 0B | Bug fixes: order status persistence, auto-transition logic, simulator-to-page sync |
| Sprint 1A | LINE webhook route, signature verification, intent parser, variant normalisation, payment instruction flow, conversation state management |

Notable implementation challenges that required QA-style thinking:
- **Order status persistence bug** — `addSimulatedOrder()` was inserting instead of upserting; fixed with `upsertSimulatedOrder()`
- **Conversation state bug** — LINE variant follow-up ("ขาว S") was not linked to pending order context; fixed with `pendingLineOrderContext`
- **Selection persistence bug** — polling reset `selectedOrderId` on every fetch due to stale closure; fixed with `useRef`

### QA Responsibility in Implementation
- Write **test cases** in parallel (don't wait for code to finish before preparing tests)
- Prepare **test data** (example messages, product IDs, edge-case inputs)
- Conduct **early testing** on completed features as they become available
- Communicate defects found during development (not just at the end)

### Risk / Quality Focus
- Bugs introduced during implementation are cheaper to fix early than after release
- Complex integration logic (webhook → parser → order → reply) has many failure points
- State management bugs (React closure, in-memory reset) can be invisible without proper testing

### Connection to My Operations Background
> In payment risk, when a new transaction review tool was released, I didn't wait for a formal training session. I tested edge cases myself — *"What if I submit with a missing field? What if I approve and then immediately cancel?"* That proactive, curious mindset is exactly what QA practitioners do during implementation phase.

---

## Phase 5 — Testing & Integration

### What happens in this phase?
The QA team (or QA-aware developer):
- Executes prepared test cases
- Records pass/fail results
- Reports defects with clear reproduction steps
- Retests fixed defects (regression testing)
- Conducts **User Acceptance Testing (UAT)** with stakeholders

### OrderFlow Example

Testing done on OrderFlow (manual, informal):

| Test | Method | Result |
|---|---|---|
| LINE webhook receives message and replies | Real LINE OA test | ✅ Pass (after variant bug fix) |
| Variant follow-up ("ขาว S") parsed correctly | Real LINE OA test | ✅ Pass (after context bug fix) |
| Payment instruction sent after order creation | Real LINE OA test | ✅ Pass (after payment flow implementation) |
| Order status persists across polling | Manual UI check | ✅ Pass (after useRef fix) |
| Order status upsert (not stuck at reserved) | Manual simulator test | ✅ Pass (after upsertSimulatedOrder fix) |
| Signature verification rejects invalid requests | Manual curl test | ✅ Pass |
| In-memory state resets on server restart | Known limitation | ⚠️ Accepted risk (documented) |

> **Note:** This informal testing is what formal QA test execution logs will document in `08_test_execution_log.md`.

### QA Responsibility in Testing
- Execute test cases systematically, not randomly
- Record results honestly — pass, fail, or blocked
- Write defect reports with: title, steps to reproduce, expected result, actual result, severity, evidence
- Retest after fixes to confirm resolution
- Ensure **regression** — fixing one thing didn't break something else
- Obtain **sign-off** from stakeholders for UAT

### Risk / Quality Focus
- Untested integration paths (LINE → webhook → parser → order) are highest risk
- Edge cases (missing variant, wrong product ID, Thai/English keyword mix) must be tested
- Regression risk: every Sprint 1A patch was a potential regression to Sprint 0B functionality

### Connection to My Operations Background
> In payment/risk operations, when reviewing a fraud case, I followed a checklist: *Check transaction history → Check customer profile → Check device/IP → Decision → Document outcome.* That structured, evidence-based approach is exactly how QA test execution works — follow the test case, record what you actually see, document your decision.

---

## Phase 6 — Maintenance

### What happens in this phase?
After release:
- Bug fixes for issues discovered in production
- Performance improvements
- New feature additions (new sprints)
- Monitoring for regression in existing features
- Documentation updates

### OrderFlow Example

OrderFlow maintenance patches performed:
- Sprint 0B Integration Patch — fixed simulator-to-page sync gaps found during manual review
- Sprint 0B Bugfix Patch — fixed order status persistence (upsert)
- Sprint 0B Automation-Flow Patch — fixed manual step that should be automatic
- Sprint 1A variant follow-up patch — fixed LINE conversation loop
- Sprint 1A payment instruction patch — added missing payment details flow
- Sprint 1A Orders page UI state patch — fixed selection persistence (useRef fix)
- Sprint 1A env template micro patch — added `.env.example` to repository

Each patch was a maintenance cycle with its own scope, testing, and commit.

### QA Responsibility in Maintenance
- **Regression testing** after every patch — confirm that fixes don't break existing features
- Review new bug reports and classify by severity and priority
- Update test cases when behaviour changes
- Ensure documentation reflects current system state
- Flag technical debt that may create future quality risks

### Risk / Quality Focus
- Maintenance patches carry regression risk — test not only the fix, but surrounding functionality
- In-memory state is a maintenance risk — data loss on restart means each test session starts fresh
- Growing codebase without automated tests increases regression risk over time

### Connection to My Operations Background
> In operations, after a process change, I always verified that the change didn't break adjacent workflows — *"If we changed the refund approval step, does the notification still send? Does the report still pull correctly?"* That's regression thinking — the core QA skill in maintenance.

---

## Full SDLC Mapping Table

| Phase | OrderFlow Example | QA Responsibility | Risk / Quality Focus | My Operations Connection |
|---|---|---|---|---|
| Planning | Sprint scope definition (no real DB, no real payments, simulator-first) | Understand scope, flag risks, identify test types needed | Scope creep, ambiguous acceptance criteria | Pre-review scoping in payment/risk operations |
| Requirement Analysis | "System parses LINE message for product ID, colour, size" | Write/review acceptance criteria, identify edge cases | Missing/ambiguous requirements | Process documentation review before handling case types |
| Design | Order lifecycle flow, webhook architecture, in-memory state design | Review for testability, identify integration points, draft test cases | Undesigned error paths, integration complexity | New workflow design review — asking "what if" questions |
| Implementation | Sprint 0A/0B/1A feature builds and bug fixes | Write test cases in parallel, prepare test data, early testing | Integration bugs, state management bugs | Proactive edge-case testing when new tools are released |
| Testing & Integration | Manual LINE real-device tests, simulator UI checks, curl tests | Execute test cases, report defects, regression test | Untested integration paths, Thai/English parsing edge cases | Structured fraud case review — checklist, evidence, decision |
| Maintenance | Sprint 0B and 1A patch cycles | Regression testing after every patch, update test cases | Regression risk from patches, growing codebase without automation | Post-change verification — "did the fix break anything adjacent?" |

---

## Interview-Ready Bullets

These are statements you can use or adapt in QA/UAT/BA job interviews, based on this document:

- *"I understand the SDLC and can map QA responsibilities to each phase — from reviewing requirements and writing acceptance criteria, through test execution and defect reporting, to regression testing in maintenance."*
- *"In my portfolio project OrderFlow, I documented how QA fits into each sprint — from scope definition in Sprint 0A planning through to regression testing in the Sprint 1A patch cycles."*
- *"I have a background in payment/risk operations, which gave me strong structured thinking, process validation, and defect escalation skills — all of which translate directly to QA roles."*
- *"I know that requirements analysis is critical because ambiguous requirements lead to ambiguous test cases — I practiced writing acceptance criteria for the LINE webhook flow in OrderFlow."*
- *"I understand regression risk — every time a bug was fixed in OrderFlow, I verified that the fix didn't break adjacent functionality."*
- *"I can identify integration points as high-risk areas — in OrderFlow, the LINE webhook → intent parser → order creation → LINE reply chain was the most complex flow and required the most testing attention."*

---

## Ray Review Checklist

Before committing this document, confirm:

- [ ] I can explain what the SDLC is in my own words (without reading this document).
- [ ] I can name all six SDLC phases from memory.
- [ ] I can give at least one OrderFlow example for each phase.
- [ ] I can explain what QA does in at least three phases.
- [ ] I can connect at least two phases to my operations background.
- [ ] The wording does not claim I was a professional QA engineer on a real product.
- [ ] I can answer: *"What is the SDLC and where does QA fit in?"* in a 2-minute interview answer.

---

*Next: See `02_test_types.md` for an overview of test types (Unit, Integration, System, UAT, Regression) with OrderFlow examples.*

# QA/UAT Learning Capstone — OrderFlow Admin OS

> **Portfolio & Learning Evidence Pack**
> Author: Ray (transitioning into QA / UAT / Business Analyst / Implementation roles)
> Last updated: 2026-06-13

---

## 1. Purpose of This Capstone

This folder documents a **self-directed QA/UAT learning capstone** built on top of a real portfolio project — OrderFlow Admin OS. The goal is to:

- Practice and demonstrate QA/UAT skills in a realistic, structured way.
- Create honest, interview-ready evidence of software testing knowledge.
- Connect my existing Operations, Payment/Risk, and workflow validation experience to QA/BA concepts.
- Build a portfolio that shows I understand *how* software is tested, *why* testing matters, and *what role* QA plays across the SDLC.

This is a **learning project and portfolio evidence pack**, not a production SaaS product.

---

## 2. Scope of This Evidence Pack

This evidence pack covers:

| Area | Included |
|---|---|
| SDLC phase mapping | ✅ |
| Test types overview (Unit, Integration, UAT, Regression) | ✅ (planned) |
| Test case writing (functional, edge, negative) | ✅ (planned) |
| Bug reporting and defect lifecycle | ✅ (planned) |
| UAT script and acceptance criteria | ✅ (planned) |
| Business Requirements / User Stories | ✅ (planned) |
| Traceability matrix (requirements → test cases) | ✅ (planned) |
| Test execution log with pass/fail results | ✅ (planned) |
| QA interview preparation notes | ✅ (planned) |

**Not in scope:**
- Real automated test scripts (out of scope for this learning stage)
- Real production deployment validation
- Real payment or banking integration testing
- Multi-tenant or enterprise SaaS readiness claims

---

## 3. What OrderFlow Admin OS Is Used For in This Capstone

OrderFlow Admin OS is a **portfolio MVP** simulating a Thai online seller / social commerce order administration workflow. It was built to demonstrate frontend development and basic business logic — not as a real commercial product.

For the purposes of this QA capstone, OrderFlow is used as a **test subject** — a realistic enough application to write proper test cases, UAT scripts, defect reports, and SDLC documentation against.

**What the app does (implemented / simulated):**

| Feature | Status |
|---|---|
| Incoming customer message intake (inbox) | Simulated / Mock |
| Product and variant selection (A001, color/size) | Simulated / Mock |
| Order reservation and status lifecycle | Simulated / Mock |
| Payment instruction flow (mock bank details) | Simulated / Mock |
| Order status updates (reserved → paid → ready → shipped) | Simulated / Mock |
| Merchant dashboard and notifications | Simulated / Mock |
| LINE Messaging API webhook (alpha integration) | Partial real integration (alpha test OA only) |
| Real database / persistent storage | ❌ Not implemented (in-memory / localStorage only) |
| Real payment processing | ❌ Not implemented |
| Real customer deployment | ❌ Not implemented |

> **Important:** All order flows, payments, and messages in this project are simulations or mocks. No real financial transactions occur. No real customer data is stored.

---

## 4. Disclaimer

> This capstone is **portfolio and learning evidence only**.
>
> - OrderFlow Admin OS is **not** a production SaaS product.
> - It does **not** process real payments, store real customer data, or serve real merchants.
> - The LINE integration is an **alpha test** against a personal test LINE Official Account only.
> - All test cases, UAT scripts, and QA documents in this folder are **created for learning purposes**.
> - Claims made in this evidence pack reflect **understanding of QA concepts** as applied to a portfolio project — not production deployment experience.
>
> This is an honest representation of junior-to-mid transition QA learning work.

---

## 5. Planned QA Evidence Files

| File | Description | Status |
|---|---|---|
| `README.md` | This file — overview, scope, disclaimer | ✅ Done |
| `01_sdlc_mapping.md` | SDLC phases mapped to OrderFlow + QA responsibility | ✅ Done |
| `02_test_types.md` | Unit, Integration, System, UAT, Regression — explained with OrderFlow examples | 🔲 Planned |
| `03_test_cases.md` | Functional, negative, and edge test cases for key OrderFlow flows | 🔲 Planned |
| `04_bug_report_template.md` | Defect report template + sample bug reports from OrderFlow testing | 🔲 Planned |
| `05_uat_script.md` | UAT acceptance script for simulated order lifecycle | 🔲 Planned |
| `06_user_stories.md` | Business requirements written as user stories with acceptance criteria | 🔲 Planned |
| `07_traceability_matrix.md` | Requirements → test case traceability matrix | 🔲 Planned |
| `08_test_execution_log.md` | Manual test execution log with pass/fail results | 🔲 Planned |
| `09_interview_prep.md` | QA interview questions and answers based on this project | 🔲 Planned |

---

## 6. How This Capstone Supports QA/UAT/BA Job Applications

### My Existing Background
I have real experience in:
- **Operations management** — process oversight, escalation handling, staff supervision
- **Payment and risk operations** — transaction review, fraud flag assessment, risk decision workflows
- **Workflow validation** — verifying that business processes are followed correctly end-to-end
- **Customer operations** — handling edge cases, escalations, and process exceptions
- **Staff training** — documenting procedures and explaining processes to new team members

### How QA/UAT/BA Connects to My Background

| My experience | QA/UAT/BA equivalent |
|---|---|
| Checking if a payment transaction followed the correct process | Functional test case execution |
| Identifying when a workflow step was skipped or done out of order | Defect detection and reporting |
| Validating that staff followed a procedure correctly | UAT script execution |
| Writing SOPs for new staff | Writing test cases and acceptance criteria |
| Supervisor sign-off on completed work | Test sign-off and QA approval |
| Escalating a risk case with full documentation | Defect report with steps to reproduce and evidence |
| Reviewing a refund or dispute case end-to-end | End-to-end regression testing |

This capstone translates that operational background into a software QA context, using OrderFlow as the test subject.

---

## 7. Ray Review Checklist

Before committing any document to this folder, check:

- [ ] I can explain this document in my own words.
- [ ] I understand how this QA concept applies to OrderFlow.
- [ ] I can give at least one example from the project.
- [ ] The wording does not overclaim production experience.
- [ ] I can answer basic interview questions from this document.

---

*This capstone is part of Ray's ongoing learning and portfolio-building work. Documents will be added progressively.*

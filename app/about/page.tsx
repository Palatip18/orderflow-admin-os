import React from "react";

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Architecture & About</h1>
        <p className="text-sm text-slate-400">Technical roadmap, limitation boundaries, and portfolio positioning details</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 shadow-lg">
        {/* Core Positioning */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-emerald-400">Portfolio MVP & Scalable Product Concept</h2>
          <p className="text-xs text-slate-350 leading-relaxed text-slate-300">
            **OrderFlow Admin OS** is designed as a commercial-grade architectural showcase. Its purpose is to demonstrate a decoupled, event-driven architecture that automates omni-channel sales admin tasks for Thai social sellers (LINE OA, Facebook Live, TikTok Live, Instagram) from a single dashboard interface.
          </p>
          <p className="text-xs text-slate-350 leading-relaxed text-slate-300">
            Unlike basic store builders or simple storefront links, OrderFlow operates as a **conversational order administrator** — parsing buyer messages, issuing reservations, verifying transaction slips, collection coordinates, and dispatching logistics records from a single pipeline.
          </p>
        </section>

        {/* Current Scope Sprint 0A */}
        <section className="space-y-4 border-t border-slate-850 pt-6">
          <h2 className="text-md font-bold text-white">Sprint 0A — Architectural Foundation Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-2">
              <h4 className="font-bold text-slate-200">✅ What Works / Simulated</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                <li>Dynamic metrics calculations calculated from mock arrays.</li>
                <li>Visual status badges mapping order and payment states.</li>
                <li>Simulated Unified Inbox display of raw logs.</li>
                <li>Sample PostgreSQL-ready relational draft models.</li>
                <li>Pure-function workflow state validation logic.</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-2">
              <h4 className="font-bold text-rose-400">❌ Out of Scope / Mocked Only</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                <li>No actual database integration (running in-memory mock).</li>
                <li>No external message hooks or live LINE/FB webhooks.</li>
                <li>No SlipOK bank scan APIs or QR payments checks.</li>
                <li>No AI LLM intent extraction calls (uses simulated regex rules).</li>
                <li>No authentication or multiple merchant spaces.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Upgrade Technical Architecture */}
        <section className="space-y-4 border-t border-slate-850 pt-6">
          <h2 className="text-md font-bold text-white">Future Commercial-Ready Scaling Roadmap</h2>
          <div className="space-y-4 text-xs">
            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500"></span>
              <h4 className="font-bold text-slate-200">Phase 1: Database Hook & Active Adapters (Next Sprint)</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Transition memory states to the PostgreSQL schema. Set up webhook endpoints for LINE OA Messenger and Facebook comment Webhook events to feed real-time messaging payloads into the pipeline.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500/50"></span>
              <h4 className="font-bold text-slate-200">Phase 2: SlipOK & Automated QR Reconciliation</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Connect payment check modules to SlipOK APIs. When an image payload is parsed, standard OCR extracts bank transaction codes and amounts, validating it instantly against target outstanding values.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-850"></span>
              <h4 className="font-bold text-slate-500">Phase 3: Conversational LLM Parser Boundaries</h4>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Integrate lightweight parsing agents (e.g., Gemini Flash) to parse ambiguous addresses and customer color/size queries. Deterministic bounds will guard execution — AI *only proposes data parameters*, but the state machine controls inventory allocations and payments confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* AI & Security Bounds */}
        <section className="space-y-3 border-t border-slate-850 pt-6 bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Strict Operational Boundaries</span>
          </h3>
          <p className="text-[11px] text-slate-450 leading-relaxed text-slate-400">
            For commercial safety, **AI is never permitted to alter stock values or confirm payments**. These bounds are enforced at the backend controller level. If an AI parser extracts address data or slip references, the parameters must be checked against transaction records, or sent to a human admin review panel for manual resolution.
          </p>
        </section>
      </div>
    </div>
  );
}

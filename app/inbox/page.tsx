"use client";

import React, { useState } from "react";
import { mockMessages } from "@/lib/mockData";
import { CHANNEL_LABELS, INTENT_LABELS } from "@/lib/statusLabels";
import { IncomingMessage } from "@/types/orderflow";

export default function UnifiedInboxPage() {
  const [messages, setMessages] = useState<IncomingMessage[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<IncomingMessage | null>(mockMessages[0] || null);

  const getStatusBadge = (status: IncomingMessage["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "processed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ignored":
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const markProcessed = (id: string) => {
    const updated = messages.map((msg) => {
      if (msg.id === id) {
        return { ...msg, status: "processed" as const };
      }
      return msg;
    });
    setMessages(updated);
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status: "processed" as const });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Unified Inbox</h1>
        <p className="text-sm text-slate-400">Simulated multi-channel customer communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch min-h-[500px]">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 font-semibold text-slate-200">
            Intake Queue ({messages.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {messages.map((msg) => {
              const channel = CHANNEL_LABELS[msg.channelType];
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-slate-900 transition flex flex-col gap-2 ${
                    isSelected ? "bg-slate-900/80 border-l-4 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${channel.iconColor.replace("text-", "bg-")}`}></span>
                      <span className="text-xs font-semibold text-slate-400">{channel.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="font-bold text-sm text-slate-200">{msg.senderName}</div>
                  <p className="text-xs text-slate-450 truncate w-full max-w-[240px] text-slate-400">
                    {msg.rawContent}
                  </p>

                  <div className="flex justify-between items-center mt-1">
                    {msg.intent ? (
                      <span className="text-[10px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded font-mono">
                        {msg.intent.detectedIntent}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded">No Intent</span>
                    )}

                    <span className={`text-[9px] px-2 py-0.5 rounded border uppercase ${getStatusBadge(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Message Detail */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Message Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start gap-4 bg-slate-950/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-lg">{selectedMessage.senderName}</span>
                    <span className="text-xs text-slate-500">ID: {selectedMessage.externalSenderId.slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Channel: <span className="font-semibold">{CHANNEL_LABELS[selectedMessage.channelType].label}</span>
                    </span>
                    <span className="text-slate-800">•</span>
                    <span className="text-xs text-slate-550 text-slate-400">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg border uppercase ${getStatusBadge(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                  {selectedMessage.status === "pending" && (
                    <button
                      onClick={() => markProcessed(selectedMessage.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Process / Confirm
                    </button>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Raw Message / ข้อความที่ส่งเข้า</p>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed font-sans text-sm">
                    {selectedMessage.rawContent}
                  </div>
                </div>

                {selectedMessage.mediaUrl && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Attached Media / สลิปหรือรูปประกอบ</p>
                    <div className="max-w-xs rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2">
                      {/* Placeholder style since no actual external slip image is loaded */}
                      <div className="h-40 bg-indigo-950/40 flex flex-col justify-center items-center text-center p-4 rounded-lg">
                        <svg className="w-8 h-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold text-slate-200">Payment Slip Uploaded</p>
                        <p className="text-[10px] text-slate-500 mt-1">Image Attachment Simulated</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intent Parser Box */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI-Assisted Intent Parsing Simulation</p>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Intent Model</span>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {selectedMessage.intent ? INTENT_LABELS[selectedMessage.intent.detectedIntent] : "None Detected"}
                        </p>
                      </div>
                      {selectedMessage.intent && (
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400">Confidence</span>
                          <p className="text-sm font-bold text-emerald-400 mt-0.5">
                            {(selectedMessage.intent.confidenceScore * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-4">
                      {selectedMessage.intent?.parsedPayload ? (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {Object.entries(selectedMessage.intent.parsedPayload).map(([key, value]) => (
                            <div key={key} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/60">
                              <span className="text-[10px] text-slate-550 text-slate-500 uppercase font-mono">{key}</span>
                              <p className="font-bold text-slate-200 mt-1">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No parameters parsed from message content.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center flex-1 p-8 text-slate-500">
              <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="font-semibold text-slate-400">No message selected</p>
              <p className="text-xs mt-1 text-slate-650">Select an item from the intake feed to view NLP extractions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

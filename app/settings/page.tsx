"use client";

import React, { useState } from "react";
import { mockSettings } from "@/lib/mockData";

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);

  const handleToggleChannel = (channel: any) => {
    const isEnabled = settings.enabledChannels.includes(channel);
    const enabledChannels = isEnabled
      ? settings.enabledChannels.filter((c) => c !== channel)
      : [...settings.enabledChannels, channel];
    setSettings({ ...settings, enabledChannels });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400">Manage business rule parameters, reservation thresholds, and channel configurations</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-850 shadow-lg overflow-hidden">
        {/* Core Rules Section */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Order Engine & Reservation Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-slate-450 block font-semibold text-slate-400">Reservation Hold Time (Minutes)</label>
              <input
                type="number"
                value={settings.reservationHoldTimeMinutes}
                onChange={(e) => setSettings({ ...settings, reservationHoldTimeMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">Duration product stock is reserved pending payment validation before automatic expiry release.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-450 block font-semibold text-slate-400">Low Stock Alert Threshold</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">Triggers an alert notification when the remaining physical inventory is at or below this limit.</p>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Payment Accounts & Displays</h3>
          <div className="space-y-1">
            <label className="text-xs text-slate-450 block font-semibold text-slate-400">Bank Display Info (Sends to customer)</label>
            <input
              type="text"
              value={settings.paymentAccountDisplay}
              onChange={(e) => setSettings({ ...settings, paymentAccountDisplay: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Text details dispatched during variant confirmations to prompt payment slips uploads.</p>
          </div>
        </div>

        {/* Integration adapters state */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Simulated Channel Adapters</h3>
          <p className="text-xs text-slate-450 text-slate-400 leading-snug">Toggle which incoming integration feeds are actively parsed by the system parser pipeline. (Visual simulator mockup)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "line", label: "LINE Official Account" },
              { id: "facebook_messenger", label: "Facebook Messenger" },
              { id: "facebook_live", label: "Facebook Live comments" },
              { id: "instagram_dm", label: "Instagram Direct Messages" },
              { id: "tiktok_live", label: "TikTok Live comment grab" },
              { id: "web_order", label: "Web Order portal link" },
            ].map((ch) => {
              const isEnabled = settings.enabledChannels.includes(ch.id as any);
              return (
                <button
                  key={ch.id}
                  onClick={() => handleToggleChannel(ch.id)}
                  className={`p-3 text-left border rounded-lg transition-all duration-200 text-xs flex justify-between items-center ${
                    isEnabled
                      ? "bg-slate-900 border-emerald-500/50 text-emerald-400 font-semibold"
                      : "bg-slate-900/40 border-slate-850 text-slate-500 hover:border-slate-800"
                  }`}
                >
                  <span>{ch.label}</span>
                  <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                    isEnabled ? "bg-emerald-500 border-emerald-400" : "bg-transparent border-slate-700"
                  }`}></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert rules settings */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-450 text-emerald-400">Live Sale Operations</h3>
          <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-850 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-200">Simulate Live Sale mode</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Increases polling rates and configures intent matching strictly to product codenames.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, liveSaleMode: !settings.liveSaleMode })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.liveSaleMode ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                settings.liveSaleMode ? "transform translate-x-5" : ""
              }`}></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">ตั้งค่าร้านค้า (Settings)</h1>
        <p className="text-sm text-slate-400">จัดการกฎธุรกิจ ระยะเวลาล็อกสต็อก และการตั้งค่าช่องทางจำลองการขาย</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-850 shadow-lg overflow-hidden">
        {/* Core Rules Section */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">กฎการจองสินค้าและระบบจัดการออเดอร์</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs block font-semibold text-slate-350">เวลาจองสินค้า (นาที) (Reservation Hold Time)</label>
              <input
                type="number"
                value={settings.reservationHoldTimeMinutes}
                onChange={(e) => setSettings({ ...settings, reservationHoldTimeMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">ระยะเวลาที่ระบบจองและล็อกสินค้าไว้เพื่อรอลูกค้าส่งสลิป ก่อนที่จะยกเลิกและคืนคลังโดยอัตโนมัติ</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs block font-semibold text-slate-350">จำนวนเตือนสินค้าใกล้หมด (Low Stock Threshold)</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">ระบบจะแจ้งเตือนในหน้าคลังสินค้าเมื่อจำนวนสินค้าคงคลังลดลงเท่ากับหรือน้อยกว่าค่านี้</p>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">บัญชีธนาคารสำหรับชำระเงิน (Payment Accounts)</h3>
          <div className="space-y-1">
            <label className="text-xs block font-semibold text-slate-350">ข้อมูลบัญชีธนาคารสำหรับชำระเงิน (ส่งให้ลูกค้า)</label>
            <input
              type="text"
              value={settings.paymentAccountDisplay}
              onChange={(e) => setSettings({ ...settings, paymentAccountDisplay: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">ข้อความรายละเอียดทางธนาคารที่จะแจ้งให้ลูกค้าทราบในการจำลองการยืนยันสินค้าเพื่อโอนเงิน</p>
          </div>
        </div>

        {/* Integration adapters state */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ช่องทางที่เปิดใช้งาน (Simulated Channel Adapters)</h3>
          <p className="text-xs text-slate-400 leading-snug">เลือกเปิดใช้งานช่องทางการจำลองรับออเดอร์เพื่อประมวลผลข้อความและ intent ของลูกค้า</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "line", label: "LINE Official Account" },
              { id: "facebook_messenger", label: "Facebook Messenger" },
              { id: "facebook_live", label: "Facebook Live (คอมเมนต์สด)" },
              { id: "instagram_dm", label: "Instagram Direct Messages" },
              { id: "tiktok_live", label: "TikTok Live (ดูดคอมเมนต์)" },
              { id: "web_order", label: "Web Order Link (ใบสั่งซื้อเว็บ)" },
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
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">โหมดไลฟ์ขายของ (Live Sale Mode)</h3>
          <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-850 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-200">เปิดโหมดจำลองไลฟ์สด</p>
              <p className="text-[10px] text-slate-500 mt-0.5">เมื่อเปิดใช้งาน ระบบจะเร่งความถี่การตรวจสอบคอมเมนต์และมุ่งเน้นการจำลองจับคู่รหัสจองสินค้า CF เป็นพิเศษ</p>
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

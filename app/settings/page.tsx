"use client";

import React, { useState, useEffect } from "react";
import { mockSettings } from "@/lib/mockData";

interface ConfigStatus {
  lineWebhookEnabled: boolean;
  channelSecretConfigured: boolean;
  channelAccessTokenConfigured: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/config-status")
      .then((res) => res.json())
      .then((data) => {
        setConfigStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch settings config status:", err);
        setLoading(false);
      });
  }, []);

  const handleToggleChannel = (channel: any) => {
    const isEnabled = settings.enabledChannels.includes(channel);
    const enabledChannels = isEnabled
      ? settings.enabledChannels.filter((c) => c !== channel)
      : [...settings.enabledChannels, channel];
    setSettings({ ...settings, enabledChannels });
  };

  const handleResetServerState = async () => {
    if (confirm("คุณต้องการล้างข้อมูลจำลองบน Server Simulation Store (LINE Alpha) ทั้งหมดใช่หรือไม่?")) {
      try {
        const res = await fetch("/api/simulation/server-state", { method: "DELETE" });
        if (res.ok) {
          alert("ล้างข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว");
        } else {
          alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
        }
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">ตั้งค่าร้านค้า (Settings)</h1>
        <p className="text-sm text-slate-400">จัดการกฎธุรกิจ ระยะเวลาล็อกสต็อก และการตั้งค่าช่องทางจำลองการขาย</p>
      </div>

      {/* LINE Webhook Alpha configuration status */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            สถานะ LINE Webhook Alpha Integration
          </h3>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono uppercase">
            Alpha Mode
          </span>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs font-semibold text-amber-300">⚠️ คำเตือนระบบในหน่วยความจำ (In-Memory Server State Warning)</p>
          <p className="text-[11px] text-amber-400/90 mt-1 leading-relaxed">
            In-memory server state is for alpha testing only. It may reset when the server restarts or when a serverless instance refreshes. Production persistence requires a database.
            (การจัดเก็บสถานะแบบ In-memory บนเซิร์ฟเวอร์มีไว้สำหรับการทดสอบเวอร์ชัน Alpha เท่านั้น ข้อมูลอาจถูกล้างเมื่อเซิร์ฟเวอร์เริ่มต้นใหม่หรือระบบรีเฟรช การบันทึกข้อมูลอย่างถาวรในระดับโปรดักชันจำเป็นต้องใช้ฐานข้อมูลจริง)
          </p>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500">กำลังตรวจสอบข้อมูลการตั้งค่าใน Environment Variables...</div>
        ) : configStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">LINE Webhook Enabled</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${configStatus.lineWebhookEnabled ? "bg-emerald-500" : "bg-red-500"}`}></span>
                <span className="text-xs font-bold text-white">
                  {configStatus.lineWebhookEnabled ? "เปิดใช้งาน (True)" : "ปิดใช้งาน (False)"}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Channel Secret Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${configStatus.channelSecretConfigured ? "bg-emerald-500" : "bg-red-500"}`}></span>
                <span className="text-xs font-bold text-white">
                  {configStatus.channelSecretConfigured ? "ตั้งค่าแล้ว (Configured)" : "ยังไม่ได้ตั้งค่า (Not Configured)"}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Channel Access Token Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${configStatus.channelAccessTokenConfigured ? "bg-emerald-500" : "bg-red-500"}`}></span>
                <span className="text-xs font-bold text-white">
                  {configStatus.channelAccessTokenConfigured ? "ตั้งค่าแล้ว (Configured)" : "ยังไม่ได้ตั้งค่า (Not Configured)"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-red-400">ไม่สามารถโหลดข้อมูลสถานะ Config ได้</div>
        )}

        <div className="pt-2 flex justify-between items-center gap-4">
          <p className="text-[11px] text-slate-400">
            * ระบบจะไม่แสดง Token หรือ Secret ของจริงในหน้าจอเพื่อความปลอดภัยขั้นสูง
          </p>
          <button
            onClick={handleResetServerState}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-950/80 border border-red-900 text-red-200 text-xs rounded transition-all duration-150"
          >
            ล้างข้อมูล LINE Alpha Store
          </button>
        </div>
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

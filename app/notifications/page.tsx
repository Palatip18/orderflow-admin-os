"use client";

import React, { useState, useEffect } from "react";
import { mockNotifications } from "@/lib/mockData";
import { MerchantNotificationMode } from "@/types/orderflow";
import { getSimulatedNotifications } from "@/lib/localOrderState";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [mode, setMode] = useState<MerchantNotificationMode>("all");

  useEffect(() => {
    const simNotifs = getSimulatedNotifications();
    const merged = [...simNotifs, ...mockNotifications.filter((mn) => !simNotifs.some((sn) => sn.id === mn.id))];
    setNotifications(merged);
  }, []);

  const alertModes: { value: MerchantNotificationMode; title: string; desc: string }[] = [
    { value: "all", title: "ทั้งหมด (All Alerts)", desc: "รับแจ้งเตือนทุกกรณี เช่น อัปเดตสต็อกสินค้า, การรับชำระเงิน, ออเดอร์ใหม่ และเคสขัดข้อง" },
    { value: "important_only", title: "เฉพาะสำคัญ (Important Only)", desc: "แจ้งเตือนเฉพาะปัญหาการจ่ายเงิน สลิปซ้ำ หรือระดับสินค้าในคลังใกล้หมดขั้นวิกฤต" },
    { value: "live_sale_mode", title: "โหมดไลฟ์ขายของ (Live Sale Mode)", desc: "เน้นการแจ้งเตือนลำดับความสำคัญสูง เช่น การพิมพ์จองสินค้าคีย์เวิร์ด และสต็อกสินค้าขาดระหว่างไลฟ์สด" },
    { value: "off", title: "ปิด (Alerts Off)", desc: "ปิดการแสดงแถบเตือนความจำในระบบแบบเรียลไทม์ทั้งหมด" },
  ];

  // Filter notification feed according to selected mode
  const filteredNotifications = notifications.filter((n) => {
    if (mode === "off") return false;
    if (mode === "important_only") {
      return n.alertLevel === "critical" || n.alertLevel === "warning";
    }
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">ศูนย์แจ้งเตือนร้านค้า (Notification Center)</h1>
        <p className="text-sm text-slate-400">ตั้งค่าระดับการแจ้งเตือนและการเตือนเหตุการณ์สำคัญในระบบ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Alert Mode Selector */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3">โหมดแจ้งเตือน (Alert Mode)</h3>
          <div className="space-y-3">
            {alertModes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  mode === m.value
                    ? "bg-emerald-950/30 border-emerald-500/50 text-white"
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{m.title}</span>
                  {mode === m.value && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </div>
                <p className="text-[10.5px] mt-1 text-slate-500 leading-snug">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Notifications Feed */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
            <span className="font-semibold text-slate-200">แจ้งเตือนล่าสุด (Recent Notifications)</span>
            {filteredNotifications.some((n) => !n.isRead) && (
              <button onClick={markAllRead} className="text-xs text-emerald-400 hover:underline">
                ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-slate-850">
            {filteredNotifications.map((not) => {
              const isUnread = !not.isRead;
              return (
                <div
                  key={not.id}
                  className={`p-4 flex gap-4 transition items-start ${
                    isUnread ? "bg-slate-900/35" : ""
                  }`}
                >
                  {/* Alert Icon badge depending on level */}
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 border ${
                      not.alertLevel === "critical"
                        ? "bg-rose-950/30 border-rose-900/50 text-rose-400"
                        : not.alertLevel === "warning"
                        ? "bg-amber-950/30 border-amber-900/50 text-amber-400"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {not.alertLevel === "critical" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          not.alertLevel === "critical" ? "text-rose-400" : not.alertLevel === "warning" ? "text-amber-400" : "text-slate-400"
                        }`}>
                          {not.alertLevel === "critical" ? "วิกฤต (Critical)" : not.alertLevel === "warning" ? "แจ้งเตือน (Warning)" : "ทั่วไป (Info)"}
                        </span>
                        {!mockNotifications.some((mn) => mn.id === not.id) && (
                          <span className="px-1.5 py-0.2 text-[8px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded">
                            Simulator Event
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(not.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{not.message}</p>
                  </div>
                </div>
              );
            })}
            {filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 py-16 text-slate-500">
                <svg className="w-10 h-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="font-semibold text-slate-400">ไม่พบประวัติการแจ้งเตือนตามที่กำหนด</p>
                <p className="text-[11px] text-slate-500 mt-1">ลองเปลี่ยนระดับการแจ้งเตือนหรือประมวลผลออเดอร์ใหม่เพิ่ม</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

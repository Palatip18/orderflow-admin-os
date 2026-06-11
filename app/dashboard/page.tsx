"use client";

import React, { useState, useEffect } from "react";
import { mockOrders, mockNotifications, mockProducts, mockOrderEvents } from "@/lib/mockData";
import { calculateDashboardMetrics } from "@/lib/dashboardMetrics";
import { ORDER_STATUS_LABELS, CHANNEL_LABELS } from "@/lib/statusLabels";
import { getSimulatedOrders, getSimulatedEvents } from "@/lib/localOrderState";
import { Order, OrderEvent } from "@/types/orderflow";
import Link from "next/link";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [events, setEvents] = useState<OrderEvent[]>(mockOrderEvents);
  const [notifications] = useState(mockNotifications);
  const [products] = useState(mockProducts);

  useEffect(() => {
    const simOrders = getSimulatedOrders();
    const mergedOrders = [...simOrders, ...mockOrders.filter((mo) => !simOrders.some((so) => so.id === mo.id))];
    setOrders(mergedOrders);

    const simEvents = getSimulatedEvents();
    const mergedEvents = [...simEvents, ...mockOrderEvents.filter((me) => !simEvents.some((se) => se.id === me.id))];
    setEvents(mergedEvents);
  }, []);

  const metrics = calculateDashboardMetrics(orders);

  // Filter orders needing immediate attention (issue or waiting payment / waiting address)
  const actionItems = orders.filter((o) => o.status === "issue" || o.status === "paid_waiting_address");

  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">แดชบอร์ดสดแบบจำลอง (Live Dashboard)</h1>
          <p className="text-sm text-slate-400">ข้อมูลในหน้านี้คำนวณจาก mock data และ browser-local simulation state เท่านั้น</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          โหมดสตรีมสด: ปิด (Live Mode: Off)
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sales Cards */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ยอดขายรวม (Total Sales)</p>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-400">{formatTHB(metrics.totalSalesAmount)}</p>
          <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
            <span>ไม่รวมรายการยกเลิก/หมดเวลา</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ยอดรับชำระแล้ว (Paid Amount)</p>
          <p className="text-2xl md:text-3xl font-extrabold text-white">{formatTHB(metrics.paidAmount)}</p>
          <div className="flex justify-between text-[11px] text-slate-450 pt-2 border-t border-slate-800">
            <span className="text-slate-400">สัดส่วนที่จ่ายแล้ว</span>
            <span className="font-semibold text-emerald-400">
              {((metrics.paidAmount / (metrics.totalSalesAmount || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ยอดค้างชำระ (Outstanding)</p>
          <p className="text-2xl md:text-3xl font-extrabold text-rose-400">{formatTHB(metrics.outstandingAmount)}</p>
          <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
            <span>รอยืนยันยอดโอนเงิน</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ออเดอร์ทั้งหมด (Total Orders)</p>
          <p className="text-2xl md:text-3xl font-extrabold text-indigo-400">{metrics.totalOrders}</p>
          <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
            <span>ทุกสถานะรายการออเดอร์</span>
          </div>
        </div>
      </div>

      {/* Process Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">ยืนยันแล้ว</p>
          <p className="text-xl font-bold text-white mt-1">{metrics.confirmedOrders}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">รอจ่าย</p>
          <p className="text-xl font-bold text-yellow-400 mt-1">{metrics.waitingPaymentOrders}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">รอที่อยู่</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">{metrics.waitingAddressOrders}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">พร้อมส่ง</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{metrics.readyToShipOrders}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">จ่ายแล้ว (Paid)</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{metrics.paidOrders}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center bg-rose-950/20 border-rose-900/40">
          <p className="text-[10px] text-rose-400 font-bold uppercase">เคสมีปัญหา</p>
          <p className="text-xl font-bold text-rose-500 mt-1">{metrics.issueOrders}</p>
        </div>
      </div>

      {/* Main dashboard content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tasks / Action Needed */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">คิวออเดอร์ที่ต้องดำเนินการ (Action Required)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-500/20">
              {actionItems.length} เคสเร่งด่วน
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {actionItems.slice(0, 5).map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status];
              const channelInfo = CHANNEL_LABELS[order.channelType];
              return (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-slate-200">{order.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      ช่องทาง: <span className="font-semibold">{channelInfo?.label}</span> | ยอดรวม: <span className="text-slate-200">{formatTHB(order.totalAmount)}</span>
                    </p>
                  </div>
                  <Link
                    href="/orders"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    จัดการแก้ไข (Resolve)
                  </Link>
                </div>
              );
            })}
            {actionItems.length === 0 && (
              <p className="text-sm text-slate-500 py-6 text-center">ไม่มีออเดอร์ตกค้างหรือพบปัญหา</p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Alerts & Simulator Logs */}
        <div className="space-y-6">
          {/* Active Notifications */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-white">เหตุการณ์ล่าสุด (Recent Events)</h2>
              <Link href="/notifications" className="text-xs text-emerald-400 hover:underline">
                ดูการแจ้งเตือนทั้งหมด
              </Link>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {events.slice(0, 5).map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">{evt.type}</span>
                    <span className="text-[9px] text-slate-500">{new Date(evt.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-350 leading-snug">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Stock Warning */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-md font-bold text-white border-b border-slate-800 pb-3">สินค้าสต็อกใกล้หมด (Low Stock)</h2>
            <div className="space-y-2.5">
              {products
                .filter((p) => p.availableStock <= 10)
                .map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{prod.name.split(" (")[0]}</p>
                      <p className="text-[10px] text-slate-500">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50 font-bold">
                        เหลืออีก {prod.availableStock} ชิ้น
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { mockOrders, mockCustomers, mockOrderItems, mockOrderEvents, mockProducts, mockVariants } from "@/lib/mockData";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, CHANNEL_LABELS } from "@/lib/statusLabels";
import { Order, OrderStatus, OrderItem, IncomingMessage, OrderEvent } from "@/types/orderflow";
import { getSimulatedOrders, updateSimulatedOrder, getSimulatedOrderItems, getSimulatedIncomingMessages, getSimulatedEvents } from "@/lib/localOrderState";

interface MergedOrder extends Order {
  dataSource?: "line_alpha" | "simulator" | "mock";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<MergedOrder[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [serverOrders, setServerOrders] = useState<MergedOrder[]>([]);
  const [serverItems, setServerItems] = useState<OrderItem[]>([]);
  const [serverEvents, setServerEvents] = useState<OrderEvent[]>([]);
  const [serverMessages, setServerMessages] = useState<IncomingMessage[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);

  const fetchServerState = async () => {
    try {
      const res = await fetch("/api/simulation/server-state");
      if (res.ok) {
        const data = await res.json();
        const lineOrders: MergedOrder[] = (data.orders || []).map((o: any) => ({
          ...o,
          dataSource: "line_alpha" as const
        }));
        setServerOrders(lineOrders);
        setServerItems(data.items || []);
        setServerEvents(data.events || []);
        setServerMessages(data.incomingMessages || []);

        const simOrders: MergedOrder[] = getSimulatedOrders().map((o) => ({
          ...o,
          dataSource: "simulator" as const
        }));

        const mockOrds: MergedOrder[] = mockOrders.map((o) => ({
          ...o,
          dataSource: "mock" as const
        }));

        // Merge: Server, then simulator, then mock
        const merged: MergedOrder[] = [...lineOrders];
        simOrders.forEach((so) => {
          if (!merged.some((o) => o.id === so.id)) {
            merged.push(so);
          }
        });
        mockOrds.forEach((mo) => {
          if (!merged.some((o) => o.id === mo.id)) {
            merged.push(mo);
          }
        });

        // Keep ordering descending by date
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(merged);

        if (!selectedOrderId && merged.length > 0) {
          setSelectedOrderId(merged[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch server state in orders page:", err);
    }
  };

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 3000);

    const simItems = getSimulatedOrderItems();
    const mergedItems = [...simItems, ...mockOrderItems.filter((mi) => !simItems.some((si) => si.id === mi.id))];
    setOrderItems(mergedItems);

    const simMsgs = getSimulatedIncomingMessages();
    setIncomingMessages(simMsgs);

    const simEvents = getSimulatedEvents();
    setEvents(simEvents);

    return () => clearInterval(interval);
  }, []);

  // Sync item arrays
  const allOrderItems = [...orderItems, ...serverItems.filter((si) => !orderItems.some((oi) => oi.id === si.id))];

  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedCustomer = selectedOrder
    ? mockCustomers.find((c) => c.id === selectedOrder.customerId)
    : null;
  const selectedItems = selectedOrder
    ? allOrderItems.filter((item) => item.orderId === selectedOrder.id)
    : [];
  
  const selectedEvents = selectedOrder
    ? [
        ...serverEvents.filter((evt) => evt.orderId === selectedOrder.id),
        ...events.filter((evt) => evt.orderId === selectedOrder.id),
        ...mockOrderEvents.filter((evt) => evt.orderId === selectedOrder.id && !events.some((se) => se.id === evt.id) && !serverEvents.some((se) => se.id === evt.id))
      ]
    : [];

  const linkedMessage = selectedOrder
    ? [...serverMessages, ...incomingMessages].find((m) => m.orderId === selectedOrder.id)
    : null;

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  // Advanced workflow logic
  const updateStatus = (id: string, newStatus: OrderStatus) => {
    const target = orders.find((o) => o.id === id);
    if (target?.dataSource === "line_alpha") {
      alert("ออเดอร์นี้ถูกสร้างจาก LINE Webhook Alpha จริง ระบบจะเปลี่ยนสถานะแบบอัตโนมัติเมื่อได้รับการโอนเงินหรือแจ้งที่อยู่ผ่าน LINE แชทเท่านั้น เพื่อรักษาความถูกต้องในการทดสอบ");
      return;
    }

    const updated = orders.map((o) => {
      if (o.id === id) {
        const updatedOrder = {
          ...o,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };

        if (o.dataSource === "simulator") {
          updateSimulatedOrder(updatedOrder);
        }
        return updatedOrder;
      }
      return o;
    });
    setOrders(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">จัดการออเดอร์ (Order Management)</h1>
        <p className="text-sm text-slate-400">จัดการสถานะออเดอร์ การจองคลังสินค้า และคิวเตรียมจัดส่ง</p>
      </div>

      {/* Warning banner for in-memory server state */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold">⚠️ หมายเหตุ (Alpha):</span>
          <span>In-memory server state is for alpha testing only. It may reset when the server restarts or refreshes. (ข้อมูล LINE จะรีเซ็ตเมื่อรีสตาร์ท)</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {["all", "reserved_waiting_payment", "paid_waiting_address", "ready_to_ship", "shipped", "issue"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === tab
                ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {tab === "all" ? "ทั้งหมด (All Orders)" : ORDER_STATUS_LABELS[tab as OrderStatus]?.label.split(" (")[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 font-semibold text-slate-200 flex justify-between items-center">
            <span>รายการออเดอร์ ({filteredOrders.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">รหัสออเดอร์ (Order ID)</th>
                  <th className="p-4">ลูกค้า (Customer)</th>
                  <th className="p-4">ช่องทาง (Channel)</th>
                  <th className="p-4">ยอดรวม (Total)</th>
                  <th className="p-4">สถานะออเดอร์ (Order Status)</th>
                  <th className="p-4">สถานะชำระเงิน (Payment)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredOrders.map((order) => {
                  const customer = mockCustomers.find((c) => c.id === order.customerId);
                  const channel = CHANNEL_LABELS[order.channelType];
                  const statusInfo = ORDER_STATUS_LABELS[order.status];
                  const payInfo = PAYMENT_STATUS_LABELS[order.paidAmount >= order.totalAmount ? "paid" : order.paidAmount > 0 ? "partial_paid" : "unpaid"];
                  const isSelected = selectedOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`hover:bg-slate-900/50 cursor-pointer transition ${
                        isSelected ? "bg-slate-900/70" : ""
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-white">
                        <div>{order.id}</div>
                        {order.dataSource === "line_alpha" && (
                          <span className="text-[9px] text-indigo-400 font-sans font-bold block mt-0.5">จาก LINE Webhook Alpha</span>
                        )}
                        {order.dataSource === "simulator" && (
                          <span className="text-[9px] text-emerald-450 font-sans font-bold block mt-0.5">จำลองจาก Simulator</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-200">{customer?.name || (order.dataSource === "line_alpha" ? "ลูกค้า LINE Alpha" : "ไม่ทราบชื่อ")}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${channel?.bgClass} ${channel?.textClass}`}>
                          {channel?.label}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{formatTHB(order.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                          {statusInfo.label.split(" (")[0]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${payInfo.bgClass} ${payInfo.textClass} ${payInfo.borderClass}`}>
                          {payInfo.label.split(" (")[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      ไม่พบรายการออเดอร์ตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail section */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Detail Header */}
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">รายละเอียดออเดอร์ (Order Details)</span>
                  <h2 className="text-lg font-bold text-white font-mono mt-0.5">{selectedOrder.id}</h2>
                  <p className="text-[11px] text-slate-400 mt-1">สร้างเมื่อ: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  
                  {selectedOrder.dataSource === "line_alpha" && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-950/50 border border-indigo-550 border-indigo-500/20 text-indigo-400 rounded-full mt-1 inline-block">
                      จาก LINE Webhook Alpha
                    </span>
                  )}
                  {selectedOrder.dataSource === "simulator" && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-950/50 border border-emerald-550 border-emerald-500/20 text-emerald-450 rounded-full mt-1 inline-block">
                      จำลองจาก Simulator
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${ORDER_STATUS_LABELS[selectedOrder.status].bgClass} ${ORDER_STATUS_LABELS[selectedOrder.status].textClass} ${ORDER_STATUS_LABELS[selectedOrder.status].borderClass}`}>
                    {ORDER_STATUS_LABELS[selectedOrder.status].label.split(" (")[0]}
                  </span>
                </div>
              </div>

              {/* Source Channel & original message */}
              <div className="space-y-2 text-xs">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ช่องทางและที่มาออเดอร์</h3>
                <div className="bg-slate-900 border border-slate-855 border-slate-850 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ช่องทางขาย:</span>
                    <span className="font-semibold text-slate-200">{CHANNEL_LABELS[selectedOrder.channelType]?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ประวัติสตรีมเหตุการณ์:</span>
                    <span className="font-semibold text-slate-200">{selectedEvents.length} รายการ</span>
                  </div>
                  {linkedMessage && (
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">ข้อความเริ่มต้นจากลูกค้า:</span>
                      <p className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 italic">
                        "{linkedMessage.rawContent}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ข้อมูลลูกค้า (Customer Details)</h3>
                <div className="text-xs bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1">
                  <p className="font-bold text-slate-200">
                    {selectedCustomer?.name || (selectedOrder.dataSource === "line_alpha" ? "ลูกค้า LINE Alpha" : "ไม่ระบุ")}
                  </p>
                  {selectedCustomer?.phone && <p className="text-slate-400">เบอร์โทรศัพท์: {selectedCustomer.phone}</p>}
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-500">ที่อยู่จัดส่ง:</span> {selectedOrder.shippingAddress || selectedCustomer?.shippingAddress || "ไม่ได้ระบุ"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">รายการสินค้า (Order Items)</h3>
                <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 space-y-2">
                   {selectedItems.map((item) => {
                    const product = mockProducts.find((p) => p.id === item.productId);
                    const variant = mockVariants.find((v) => v.id === item.variantId);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{product?.name || "ไม่ระบุสินค้า"}</p>
                          <p className="text-[9px] text-slate-500">
                            SKU: {variant ? variant.sku : product?.sku || "N/A"}
                          </p>
                          {variant && (
                            <p className="text-[10px] text-emerald-450 mt-0.5">
                              ตัวเลือก: <span className="font-bold">{variant.name}</span>
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-200">{formatTHB(item.totalAmount)}</p>
                          <p className="text-[10px] text-slate-500">จำนวน: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">รวมทั้งหมด:</span>
                    <span className="text-emerald-400 text-sm">{formatTHB(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Expiration Details */}
              {selectedOrder.expiresAt && selectedOrder.status === "reserved_waiting_payment" && (
                <div className="bg-amber-955/20 bg-amber-900/10 border border-amber-900/50 rounded-lg p-3 text-xs text-amber-200 space-y-1">
                  <p className="font-bold">⏰ การจองสินค้าหมดอายุ</p>
                  <p className="text-[11px]">รายการจองสินค้านี้จะหมดอายุโดยอัตโนมัติเวลา {new Date(selectedOrder.expiresAt).toLocaleTimeString()}</p>
                </div>
              )}

              {/* Actions Controls */}
              <div className="space-y-2 border-t border-slate-850 pt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ปุ่มจำลองสถานะ (สำหรับ Demo Sprint 0A/0B เท่านั้น)</h3>
                <p className="text-[10px] text-slate-550 text-slate-500 leading-snug">
                  ปุ่มเหล่านี้ใช้จำลองเหตุการณ์ในอนาคต ไม่มีการเชื่อมต่อ payment, bank, channel หรือ logistics API จริง
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedOrder.status === "reserved_waiting_payment" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "paid_waiting_address")}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      ตรวจสอบการชำระเงิน (Verify Payment)
                    </button>
                  )}
                  {selectedOrder.status === "paid_waiting_address" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "ready_to_ship")}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      จำลองการกรอกที่อยู่ (Mock Address)
                    </button>
                  )}
                  {selectedOrder.status === "ready_to_ship" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "shipped")}
                      className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      ส่งของและเพิ่มเลขพัสดุ (Add Tracking)
                    </button>
                  )}
                  {selectedOrder.status === "issue" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "ready_to_ship")}
                      className="bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      แก้ไข/ข้ามเคสมีปัญหา (Override)
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "cancelled")}
                    className="bg-rose-950 text-rose-450 text-rose-400 border border-rose-900/60 text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-rose-900/30"
                  >
                    ยกเลิกออเดอร์ (Cancel)
                  </button>
                </div>
              </div>

              {/* Event Log Stream */}
              <div className="space-y-2 border-t border-slate-850 pt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ประวัติกิจกรรม (Activity Log)</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedEvents.map((evt) => (
                    <div key={evt.id} className="p-2 rounded bg-slate-900 border border-slate-850 text-[10px] space-y-0.5">
                      <div className="flex justify-between text-slate-400">
                        <span className="font-semibold text-emerald-450">{evt.type}</span>
                        <span>{new Date(evt.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-200">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>เลือกรายการออเดอร์จากรายการด้านซ้ายเพื่อแสดงข้อมูลรายละเอียด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { mockOrders, mockCustomers, mockOrderItems, mockOrderEvents } from "@/lib/mockData";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, CHANNEL_LABELS } from "@/lib/statusLabels";
import { Order, OrderStatus } from "@/types/orderflow";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(mockOrders[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    ? mockOrderItems.filter((item) => item.orderId === selectedOrder.id)
    : [];
  const selectedEvents = selectedOrder
    ? mockOrderEvents.filter((evt) => evt.orderId === selectedOrder.id)
    : [];

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  // Simple handler to advance manual workflow status for Sprint 0A interactive demo
  const updateStatus = (id: string, newStatus: any) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        return {
          ...o,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    setOrders(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Order Management</h1>
        <p className="text-sm text-slate-400">Manage order states, reserves, and shipping queues</p>
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
            {tab === "all" ? "All Orders" : ORDER_STATUS_LABELS[tab as OrderStatus]?.label.split(" / ")[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 font-semibold text-slate-200 flex justify-between items-center">
            <span>Orders List ({filteredOrders.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
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
                      <td className="p-4 font-mono font-bold text-white">{order.id}</td>
                      <td className="p-4 text-slate-200">{customer?.name || "Unknown"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${channel?.bgClass} ${channel?.textClass}`}>
                          {channel?.label}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{formatTHB(order.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                          {statusInfo.label.split(" / ")[0]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${payInfo.bgClass} ${payInfo.textClass} ${payInfo.borderClass}`}>
                          {payInfo.label.split(" / ")[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No orders found matching the filter criteria.
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Order Details</span>
                  <h2 className="text-lg font-bold text-white font-mono mt-0.5">{selectedOrder.id}</h2>
                  <p className="text-[11px] text-slate-400 mt-1">Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${ORDER_STATUS_LABELS[selectedOrder.status].bgClass} ${ORDER_STATUS_LABELS[selectedOrder.status].textClass} ${ORDER_STATUS_LABELS[selectedOrder.status].borderClass}`}>
                    {ORDER_STATUS_LABELS[selectedOrder.status].label.split(" / ")[0]}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <h3 className="text-[11px] text-slate-450 font-bold uppercase tracking-wider text-slate-400">Customer Details</h3>
                <div className="text-xs bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-1">
                  <p className="font-bold text-slate-200">{selectedCustomer?.name}</p>
                  {selectedCustomer?.phone && <p className="text-slate-400">Phone: {selectedCustomer.phone}</p>}
                  <p className="text-slate-450 mt-1 text-slate-450 leading-relaxed text-slate-350">
                    <span className="font-semibold text-slate-500">Address:</span> {selectedOrder.shippingAddress || selectedCustomer?.shippingAddress || "Not Provided"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h3 className="text-[11px] text-slate-450 font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
                <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">Classic Elephant Pants</p>
                        <p className="text-[9px] text-slate-500">SKU: {item.productId === "prod_001" ? "ELE-001-BLK" : "SLK-DRS-GLD-M"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-200">{formatTHB(item.totalAmount)}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-emerald-400 text-sm">{formatTHB(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Expiration Details */}
              {selectedOrder.expiresAt && selectedOrder.status === "reserved_waiting_payment" && (
                <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-3 text-xs text-amber-200 space-y-1">
                  <p className="font-bold">⏰ Reservation Expiration</p>
                  <p className="text-[11px]">This stock hold will expire automatically on {new Date(selectedOrder.expiresAt).toLocaleTimeString()}.</p>
                </div>
              )}

              {/* Actions Controls (Sprint 0A Manual Simulation) */}
              <div className="space-y-2 border-t border-slate-850 pt-4">
                <h3 className="text-[11px] text-slate-450 font-bold uppercase tracking-wider text-slate-400">Status Controls (Simulated)</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === "reserved_waiting_payment" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "paid_waiting_address")}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      Verify Payment / Slip OK
                    </button>
                  )}
                  {selectedOrder.status === "paid_waiting_address" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "ready_to_ship")}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      Fill Mock Address
                    </button>
                  )}
                  {selectedOrder.status === "ready_to_ship" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "shipped")}
                      className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      Dispatch / Add Tracking
                    </button>
                  )}
                  {selectedOrder.status === "issue" && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "ready_to_ship")}
                      className="bg-slate-700 hover:bg-slate-655 text-white text-[10px] font-bold px-2.5 py-1.5 rounded"
                    >
                      Override Issue
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "cancelled")}
                    className="bg-rose-950 text-rose-400 border border-rose-900/60 text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-rose-900/30"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Select an order from the list to display details and history logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

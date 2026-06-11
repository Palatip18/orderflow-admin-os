import React from "react";
import { OrderEvent } from "@/types/orderflow";

interface OrderLifecycleTimelineProps {
  events: OrderEvent[];
}

export default function OrderLifecycleTimeline({ events }: OrderLifecycleTimelineProps) {
  const getEventBadgeClass = (type: OrderEvent["type"]) => {
    switch (type) {
      case "order_detected":
        return "bg-blue-950 text-blue-400 border-blue-900/40";
      case "variant_required":
        return "bg-amber-950 text-amber-400 border-amber-900/40";
      case "order_confirmed":
      case "stock_reserved":
        return "bg-indigo-950 text-indigo-400 border-indigo-900/40";
      case "payment_verified_mock":
        return "bg-emerald-950 text-emerald-400 border-emerald-900/40";
      case "address_received":
      case "ready_to_ship":
        return "bg-cyan-950 text-cyan-400 border-cyan-900/40";
      case "tracking_added":
        return "bg-teal-950 text-teal-400 border-teal-900/40";
      case "human_review_required":
        return "bg-rose-950 text-rose-400 border-rose-900/40";
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ประวัติเหตุการณ์จำลอง (Simulation Events)</p>
      
      <div className="relative border-l border-slate-800 pl-4 space-y-4">
        {events.map((evt) => (
          <div key={evt.id} className="relative text-xs">
            {/* Timeline dot */}
            <span className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-slate-800 border border-slate-950"></span>
            
            <div className="flex justify-between items-start">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-semibold ${getEventBadgeClass(evt.type)}`}>
                {evt.type}
              </span>
              <span className="text-[9.5px] text-slate-500 font-mono">
                {new Date(evt.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-snug font-sans">{evt.description}</p>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-slate-500 text-center py-4 text-xs">ยังไม่มีประวัติการจำลองในระบบ</p>
        )}
      </div>
    </div>
  );
}

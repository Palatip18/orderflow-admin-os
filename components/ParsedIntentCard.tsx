import React from "react";
import { ParsedOrderIntent } from "@/types/orderflow";
import { INTENT_LABELS } from "@/lib/statusLabels";

interface ParsedIntentCardProps {
  intent: ParsedOrderIntent;
  appliedColor?: string;
  appliedSize?: string;
}

export default function ParsedIntentCard({ intent, appliedColor, appliedSize }: ParsedIntentCardProps) {
  const payload = intent.parsedPayload || {};
  const isHighConfidence = intent.confidenceScore >= 0.8;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ข้อมูลที่ระบบอ่านได้ (Parsed Intent)</span>
          <h4 className="text-sm font-bold text-white mt-0.5">
            {intent.detectedIntent ? INTENT_LABELS[intent.detectedIntent] : "สอบถามทั่วไป"}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">ความแม่นยำ</span>
          <span className={`text-xs font-mono font-bold ${(isHighConfidence) ? "text-emerald-400" : "text-amber-400"}`}>
            {(intent.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">รหัสสินค้า (SKU)</span>
          <span className="font-bold text-slate-200 mt-1 block font-mono">{payload.productCode || "ไม่ระบุ"}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">จำนวน</span>
          <span className="font-bold text-slate-200 mt-1 block">{payload.quantity || "1"} ชิ้น</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">ไซส์ (Size)</span>
          <span className="font-bold text-slate-200 mt-1 block">
            {appliedSize ? (
              <span className="text-emerald-400 font-semibold">{appliedSize} (เลือกแล้ว)</span>
            ) : (
              payload.size || "ไม่ระบุ"
            )}
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">สี (Color)</span>
          <span className="font-bold text-slate-200 mt-1 block">
            {appliedColor ? (
              <span className="text-emerald-400 font-semibold">{appliedColor} (เลือกแล้ว)</span>
            ) : (
              payload.color || "ไม่ระบุ"
            )}
          </span>
        </div>
      </div>

      {payload.addressText && (
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs space-y-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">ที่อยู่จัดส่ง (Parsed Address)</span>
          <p className="text-slate-350 leading-relaxed font-sans">{payload.addressText}</p>
        </div>
      )}

      {payload.slipReference && (
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs space-y-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">รหัสอ้างอิงสลิป (Reference ID)</span>
          <p className="font-mono font-bold text-slate-200">{payload.slipReference}</p>
        </div>
      )}
    </div>
  );
}

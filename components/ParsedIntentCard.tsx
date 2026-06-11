import React from "react";
import { ParsedOrderIntent } from "@/types/orderflow";
import { INTENT_LABELS } from "@/lib/statusLabels";

interface ParsedIntentCardProps {
  intent: ParsedOrderIntent;
}

export default function ParsedIntentCard({ intent }: ParsedIntentCardProps) {
  const payload = intent.parsedPayload || {};
  const isHighConfidence = intent.confidenceScore >= 0.8;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Parser Extraction Logs</span>
          <h4 className="text-sm font-bold text-white mt-0.5">
            {intent.detectedIntent ? INTENT_LABELS[intent.detectedIntent] : "General Query"}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Confidence</span>
          <span className={`text-xs font-mono font-bold ${(isHighConfidence) ? "text-emerald-400" : "text-amber-400"}`}>
            {(intent.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Product Code (SKU)</span>
          <span className="font-bold text-slate-200 mt-1 block font-mono">{payload.productCode || "None Match"}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Quantity</span>
          <span className="font-bold text-slate-200 mt-1 block">{payload.quantity || "1"} pcs</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Size</span>
          <span className="font-bold text-slate-200 mt-1 block">{payload.size || "Unknown"}</span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Color</span>
          <span className="font-bold text-slate-200 mt-1 block">{payload.color || "Unknown"}</span>
        </div>
      </div>

      {payload.addressText && (
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs space-y-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Parsed Address Block</span>
          <p className="text-slate-350 leading-relaxed font-sans">{payload.addressText}</p>
        </div>
      )}

      {payload.slipReference && (
        <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-xs space-y-1">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Reference Slip ID</span>
          <p className="font-mono font-bold text-slate-200">{payload.slipReference}</p>
        </div>
      )}
    </div>
  );
}

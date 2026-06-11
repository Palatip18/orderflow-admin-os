import React from "react";

export default function SimulationNotice() {
  return (
    <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl text-xs text-amber-200 flex gap-3 items-start">
      <svg className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <span className="font-bold block mb-0.5">ระบบจำลองและทดสอบขั้นตอนรับออเดอร์ Sprint 0B (Demo Only)</span>
        <p className="leading-relaxed text-slate-350">
          ระบบนี้ใช้เพื่อจำลองขั้นตอนการรับออเดอร์ การเลือกสี/ไซส์ และการสแกนสลิปโอนเงินแบบจำลองเท่านั้น โดยยังไม่มีการบันทึกฐานข้อมูลจริง ไม่มีการเชื่อมต่อ Webhook จริง (LINE, FB, TikTok) ไม่มีการตรวจสลิปผ่าน SlipOK หรือธนาคารจริง และไม่มีการทำธุรกรรมการเงินภายนอกใดๆ ทั้งสิ้น
        </p>
      </div>
    </div>
  );
}

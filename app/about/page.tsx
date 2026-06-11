import React from "react";

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">สถาปัตยกรรมระบบและเกี่ยวกับระบบ (System Architecture & About)</h1>
        <p className="text-sm text-slate-400">แผนพัฒนาทางเทคนิค ขอบเขตความปลอดภัย และตำแหน่งผลิตภัณฑ์ของ Portfolio MVP นี้</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 shadow-lg">
        {/* Core Positioning */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-emerald-400">Portfolio MVP & แพลตฟอร์มต้นแบบที่พร้อมต่อยอด (Scalable Product Concept)</h2>
          <p className="text-xs leading-relaxed text-slate-350">
            **OrderFlow Admin OS** ถูกออกแบบมาเพื่อเป็นผลงานแสดงสถาปัตยกรรมซอฟต์แวร์ระดับ Commercial-grade เพื่อแสดงโครงสร้างแบบ Event-driven ที่ช่วยลดภาระงานของแอดมินร้านค้าออนไลน์ในไทย (LINE OA, Facebook Live, TikTok Live, Instagram) ให้สามารถจัดการออเดอร์ทั้งหมดได้จากแดชบอร์ดกลางเพียงแห่งเดียว
          </p>
          <p className="text-xs leading-relaxed text-slate-350">
            ต่างจากระบบสร้างร้านค้าทั่วไป OrderFlow ทำหน้าที่เสมือน **"ผู้ช่วยแอดมินอัจฉริยะ"** ที่ช่วยวิเคราะห์ความตั้งใจของผู้ซื้อจากข้อความแชท ทำการจองสินค้าในสต็อก ตรวจสอบภาพสลิปโอนเงิน บันทึกข้อมูลที่อยู่จัดส่ง และส่งข้อมูลเลขพัสดุผ่านกระบวนการทำงานแบบ Pipeline อัตโนมัติ
          </p>
        </section>

        {/* Current Scope Sprint 0B */}
        <section className="space-y-4 border-t border-slate-850 pt-6">
          <h2 className="text-md font-bold text-white">ขอบเขตความสามารถใน Sprint 0B — ระบบจำลองขั้นตอนรับออเดอร์</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-2">
              <h4 className="font-bold text-slate-200">✅ ระบบทำงาน / จำลองแบบ Interactive ได้</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400 font-sans">
                <li>คำนวณและประมวลผลแดชบอร์ดแบบจำลองเรียลไทม์จาก mock data และสถานะในเบราว์เซอร์</li>
                <li>เครื่องมือจำลอง 4 ขั้นตอนการรับออเดอร์ (Message, Stock, Payment, Address) แบบโต้ตอบได้จริง</li>
                <li>การเปลี่ยนสถานะออเดอร์และการชำระเงินจำลองตามกฎเกณฑ์ธุรกิจ (Business Rules)</li>
                <li>แสดงคิวข้อมูลแชทขาเข้าจำลองพร้อมจำลองการถอด Intent ภาษาไทย</li>
                <li>แผนภาพโครงสร้างข้อมูล (PostgreSQL Schema) และตัวอย่าง SQL Query สำหรับพร้อมใช้งานจริง</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-2">
              <h4 className="font-bold text-rose-400">❌ ยังไม่ได้เชื่อมต่อจริง / ใช้ข้อมูลจำลองเท่านั้น</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400 font-sans">
                <li>ยังไม่มีการบันทึกข้อมูลในฐานข้อมูลจริง (ทำงานใน Browser Local State และ LocalStorage)</li>
                <li>ยังไม่มีการเชื่อมต่อ LINE Official Account Webhook หรือ Facebook API จริง</li>
                <li>ยังไม่มีการสแกน QR Code หรือตรวจสอบยอดเงินผ่าน API ของ SlipOK หรือธนาคารจริง</li>
                <li>ยังไม่มีการต่อบอท AI LLM สำหรับแกะข้อความจริง (จำลองโดยใช้กฎจำลอง regex)</li>
                <li>ยังไม่มีการลงทะเบียนผู้ใช้งาน (Authentication) หรือระบบร้านค้าสาขา</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Upgrade Technical Architecture */}
        <section className="space-y-4 border-t border-slate-850 pt-6">
          <h2 className="text-md font-bold text-white">แผนงานการพัฒนาเชิงพาณิชย์ในอนาคต (Technical Roadmap)</h2>
          <div className="space-y-4 text-xs font-sans">
            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500"></span>
              <h4 className="font-bold text-slate-200">เฟส 1: การต่อฐานข้อมูลเชิงสัมพันธ์และตัวเชื่อมต่อ Webhook (Next Sprint)</h4>
              <p className="text-slate-450 mt-1 leading-relaxed">
                ย้ายหน่วยความจำของหน้าคอนโซลไปรันบนระบบฐานข้อมูล PostgreSQL จริง และเปิดช่องทาง Webhook เพื่อคอยตรวจรับข้อมูลแชทและคอมเมนต์สดจาก LINE OA และ Facebook Messenger ให้วิ่งเข้าสู่ระเบียบการประมวลผลหลัก
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500/50"></span>
              <h4 className="font-bold text-slate-200">เฟส 2: บริการจับคู่ธนาคารผ่านระบบ SlipOK API</h4>
              <p className="text-slate-450 mt-1 leading-relaxed">
                เชื่อมต่อระบบสแกนสลิปเข้ากับ API ของ SlipOK เพื่อให้สามารถถอดรหัสธุรกรรม (Ref Code) และยอดเงินโอนจริงจากภาพถ่ายสลิปของลูกค้า นำมาตรวจสอบเปรียบเทียบกับยอดค้างชำระของระบบแบบเรียลไทม์
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-800"></span>
              <h4 className="font-bold text-slate-500">เฟส 3: นำ AI/LLM มาช่วยประมวลผลข้อความและข้อมูลที่อยู่</h4>
              <p className="text-slate-500 mt-1 leading-relaxed">
                รวมบริการ AI (เช่น Gemini Flash) เข้ามาแกะข้อมูลที่อยู่ที่มีรูปแบบพิมพ์หลากหลายของไทย พร้อมระบุข้อมูลที่ยังขาด และตั้งระบบป้องกัน (Guardrails) ว่า AI ทำหน้าที่เสนอพารามิเตอร์ข้อมูลเท่านั้น แต่ขั้นตอนการจองและตัดสต็อกจะกระทำผ่านสเตทแมชชีนของซอฟต์แวร์โดยตรง
              </p>
            </div>
          </div>
        </section>

        {/* AI & Security Bounds */}
        <section className="space-y-3 border-t border-slate-850 pt-6 bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>ขอบเขตความปลอดภัยและกฎของระบบ (Strict Operational Boundaries)</span>
          </h3>
          <p className="text-[11px] leading-relaxed text-slate-400">
            เพื่อความปลอดภัยสูงสุดในระบบเชิงพาณิชย์ **AI จะไม่มีสิทธิ์เข้าแก้ไขคลังสินค้าหรือกดยืนยันการชำระเงินโดยเด็ดขาด** กฎเหล็กนี้บังคับใช้ในระดับ Controller ของระบบ หากตัวแปลภาษาของ AI ถอดข้อมูลที่อยู่หรือเลขสลิปออกมา ค่าเหล่านั้นจะถูกส่งผ่านไปเปรียบเทียบกับเอกสารอ้างอิงของระบบ หรือส่งเข้าคิวงานของมนุษย์แอดมินกดยืนยันการตัดสินใจสุดท้ายด้วยตัวเองเสมอ
          </p>
        </section>
      </div>
    </div>
  );
}

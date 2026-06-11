import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Header navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2 font-bold text-xl text-emerald-400">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>OrderFlow <span className="text-slate-400 font-normal text-sm">Admin OS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-slate-400 hover:text-slate-200 transition">
            ดูแผนระบบ
          </Link>
          <Link
            href="/dashboard"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 shadow-lg shadow-emerald-500/10"
          >
            เข้าสู่แดชบอร์ด
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 text-xs font-medium mx-auto mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Sprint 0B: ตัวจำลองขั้นตอนรับออเดอร์
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          ระบบแอดมินอัตโนมัติ 24/7 สำหรับรับออเดอร์หลายช่องทาง
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          แพลตฟอร์มต้นแบบสำหรับร้านค้าออนไลน์และร้านไลฟ์สดในไทย ช่วยจำลองการรับออเดอร์ ตรวจสินค้า ถามสี/ไซด์ จองสินค้า ตรวจชำระเงินแบบ mock ขอที่อยู่ จัดคิวรอส่ง และติดตามสถานะผ่านแดชบอร์ดกลาง
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/20 text-lg flex items-center justify-center gap-2"
          >
            <span>เข้าสู่แดชบอร์ด</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl transition duration-200 border border-slate-700 text-lg"
          >
            ดูแผนระบบ
          </Link>
        </div>

        {/* Portfolio Notice Banner */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl max-w-3xl mx-auto text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>หมายเหตุ: Portfolio MVP / ระบบจำลองเพื่อแสดงแนวคิด</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            OrderFlow Admin OS เป็น commercial-ready portfolio MVP และ scalable product concept ยังไม่ใช่ระบบ SaaS ที่เปิดใช้งานจริง การเชื่อมต่อ LINE, Facebook, Instagram, TikTok, SlipOK, AI และ payment verification ทั้งหมดเป็น simulated/mock ใน Sprint นี้ ไม่มีการเชื่อมต่อ API จริง ไม่มีฐานข้อมูลจริง และไม่มีธุรกรรมเงินจริง
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">กล่องข้อความรวมหลายช่องทางแบบจำลอง</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              รวมข้อความและความคิดเห็นจาก LINE OA, Facebook Messenger, Facebook Live, IG และ TikTok แสดงการประมวลผล Intent ด้วย AI แบบจำลองได้จากระบบโดยตรง
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ประมวลผลออเดอร์ด้วยกฎธุรกิจ</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              จัดการการจองสินค้าอัตโนมัติพร้อมกำหนดเวลาจอง การเปลี่ยนสถานะออเดอร์เป็นไปตามกฎธุรกิจที่เข้มงวดโดยอิงตามรหัสธุรกรรมและยอดเงินที่ตรงกันแบบจำลอง
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4m0-10L4 7m8 4v10M4 7v10l8 4m0-10L20 7m-8 4V3L4 7m8 4l8-4m0 0v10l-8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">โครงสร้างข้อมูลพร้อมต่อยอด SQL</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              ออกแบบโครงสร้างฐานข้อมูลเชิงสัมพันธ์สำหรับ PostgreSQL ที่พร้อมอัปเกรด ทั้งการจับคู่ลูกค้า คุณลักษณะตัวเลือกสินค้า ประวัติสต็อก และบันทึกการชำระเงินสำหรับรองรับการขยายตัวในอนาคต
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-8 text-center text-xs text-slate-500 px-6">
        <p>© 2026 OrderFlow Admin OS. Built as a commercial-grade portfolio MVP / Architecture Concept.</p>
        <p className="mt-1">Sprint 0B: ตัวจำลองขั้นตอนรับออเดอร์. Designed with Next.js, React, Tailwind, and TypeScript.</p>
      </footer>
    </div>
  );
}

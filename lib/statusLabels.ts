import { OrderStatus, PaymentStatus, ChannelType, OrderIntent } from "@/types/orderflow";

export interface StatusStyle {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, StatusStyle> = {
  draft: {
    label: "Draft / ร่างคำสั่งซื้อ",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    borderClass: "border-slate-200",
  },
  waiting_variant: {
    label: "Waiting Variant / รอระบุตัวเลือก",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  confirmed: {
    label: "Confirmed / ยืนยันรายการ",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  reserved_waiting_payment: {
    label: "Reserved (Waiting Payment) / จองสินค้า รอชำระเงิน",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-200",
  },
  paid_waiting_address: {
    label: "Paid (Waiting Address) / ชำระแล้ว รอที่อยู่",
    bgClass: "bg-cyan-50",
    textClass: "text-cyan-700",
    borderClass: "border-cyan-200",
  },
  ready_to_ship: {
    label: "Ready to Ship / เตรียมจัดส่ง",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  shipped: {
    label: "Shipped / จัดส่งแล้ว",
    bgClass: "bg-teal-50",
    textClass: "text-teal-700",
    borderClass: "border-teal-200",
  },
  completed: {
    label: "Completed / สำเร็จ",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
  },
  cancelled: {
    label: "Cancelled / ยกเลิก",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
  },
  expired: {
    label: "Expired / หมดเวลาจอง",
    bgClass: "bg-slate-50",
    textClass: "text-slate-400",
    borderClass: "border-slate-200",
  },
  issue: {
    label: "Issue Pending / พบปัญหา",
    bgClass: "bg-rose-100 animate-pulse",
    textClass: "text-rose-800 font-semibold",
    borderClass: "border-rose-300",
  },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, StatusStyle> = {
  unpaid: {
    label: "Unpaid / ยังไม่ชำระ",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-200",
  },
  pending_verification: {
    label: "Pending Slip Verification / รอตรวจสอบสลิป",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-300",
  },
  paid: {
    label: "Paid / ชำระเงินเรียบร้อย",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-300",
  },
  partial_paid: {
    label: "Partially Paid / ชำระบางส่วน",
    bgClass: "bg-orange-100",
    textClass: "text-orange-800",
    borderClass: "border-orange-300",
  },
  amount_mismatch: {
    label: "Amount Mismatch / ยอดเงินไม่ตรง",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800 font-semibold",
    borderClass: "border-rose-300",
  },
  duplicate_slip: {
    label: "Duplicate Slip / สลิปซ้ำซ้อน",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800 font-bold",
    borderClass: "border-rose-300",
  },
  invalid_slip: {
    label: "Invalid Slip / สลิปไม่ถูกต้อง",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800",
    borderClass: "border-rose-300",
  },
  expired: {
    label: "Expired / หมดเวลาชำระ",
    bgClass: "bg-slate-100",
    textClass: "text-slate-400",
    borderClass: "border-slate-200",
  },
};

export const CHANNEL_LABELS: Record<ChannelType, { label: string; iconColor: string; bgClass: string; textClass: string }> = {
  line: {
    label: "LINE OA",
    iconColor: "text-emerald-500",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  facebook_messenger: {
    label: "FB Messenger",
    iconColor: "text-blue-500",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
  },
  facebook_live: {
    label: "FB Live",
    iconColor: "text-red-500",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
  },
  instagram_dm: {
    label: "IG DM",
    iconColor: "text-pink-500",
    bgClass: "bg-pink-50",
    textClass: "text-pink-700",
  },
  instagram_live: {
    label: "IG Live",
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
  },
  tiktok_live: {
    label: "TikTok Live",
    iconColor: "text-slate-900",
    bgClass: "bg-slate-100",
    textClass: "text-slate-800",
  },
  web_order: {
    label: "Web Link",
    iconColor: "text-indigo-500",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-700",
  },
};

export const INTENT_LABELS: Record<OrderIntent, string> = {
  product_inquiry: "Product Inquiry / สอบถามสินค้า",
  order: "Buy Intent / สั่งซื้อสินค้า",
  variant_answer: "Variant Specified / เลือกสี/ไซส์",
  payment_slip: "Payment Slip Submitted / ส่งสลิปโอนเงิน",
  address: "Address Submitted / ส่งที่อยู่จัดส่ง",
  tracking_request: "Tracking Inquiry / ขอเลขพัสดุ",
  unknown: "General Message / อื่นๆ",
};

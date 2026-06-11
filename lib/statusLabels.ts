import { OrderStatus, PaymentStatus, ChannelType, OrderIntent } from "@/types/orderflow";

export interface StatusStyle {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, StatusStyle> = {
  draft: {
    label: "ร่างออเดอร์ (Draft)",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    borderClass: "border-slate-200",
  },
  waiting_variant: {
    label: "รอสี/ไซส์ (Waiting Variant)",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  confirmed: {
    label: "ยืนยันแล้ว (Confirmed)",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  reserved_waiting_payment: {
    label: "จองสินค้า / รอจ่าย (Reserved)",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-200",
  },
  paid_waiting_address: {
    label: "จ่ายแล้ว / รอที่อยู่ (Paid, Waiting Addr)",
    bgClass: "bg-cyan-50",
    textClass: "text-cyan-700",
    borderClass: "border-cyan-200",
  },
  ready_to_ship: {
    label: "พร้อมส่ง (Ready to Ship)",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  shipped: {
    label: "ส่งแล้ว (Shipped)",
    bgClass: "bg-teal-50",
    textClass: "text-teal-700",
    borderClass: "border-teal-200",
  },
  completed: {
    label: "สำเร็จ (Completed)",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
  },
  cancelled: {
    label: "ยกเลิก (Cancelled)",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
  },
  expired: {
    label: "หมดเวลาจอง (Expired)",
    bgClass: "bg-slate-50",
    textClass: "text-slate-400",
    borderClass: "border-slate-200",
  },
  issue: {
    label: "มีปัญหา (Issue)",
    bgClass: "bg-rose-100 animate-pulse",
    textClass: "text-rose-800 font-semibold",
    borderClass: "border-rose-300",
  },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, StatusStyle> = {
  unpaid: {
    label: "ยังไม่จ่าย (Unpaid)",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-200",
  },
  pending_verification: {
    label: "รอตรวจชำระเงิน (Pending)",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-300",
  },
  paid: {
    label: "จ่ายแล้ว (Paid)",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-300",
  },
  partial_paid: {
    label: "จ่ายบางส่วน (Partial Paid)",
    bgClass: "bg-orange-100",
    textClass: "text-orange-800",
    borderClass: "border-orange-300",
  },
  amount_mismatch: {
    label: "ยอดไม่ตรง (Mismatch)",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800 font-semibold",
    borderClass: "border-rose-300",
  },
  duplicate_slip: {
    label: "สลิปซ้ำ (Duplicate)",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800 font-bold",
    borderClass: "border-rose-300",
  },
  invalid_slip: {
    label: "สลิปไม่ถูกต้อง (Invalid)",
    bgClass: "bg-rose-100",
    textClass: "text-rose-800",
    borderClass: "border-rose-300",
  },
  expired: {
    label: "หมดเวลา (Expired)",
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
  product_inquiry: "สอบถามสินค้า (Product Inquiry)",
  order: "สั่งซื้อสินค้า (Buy Intent)",
  variant_answer: "เลือกสี/ไซส์ (Variant Specified)",
  payment_slip: "ส่งสลิปโอนเงิน (Payment Slip)",
  address: "ส่งที่อยู่จัดส่ง (Address)",
  tracking_request: "ขอเลขพัสดุ (Tracking Inquiry)",
  unknown: "อื่นๆ (General Query)",
};

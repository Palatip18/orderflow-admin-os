export type ChannelType =
  | "line"
  | "facebook_messenger"
  | "facebook_live"
  | "instagram_dm"
  | "instagram_live"
  | "tiktok_live"
  | "web_order";

export type OrderIntent =
  | "product_inquiry"
  | "order"
  | "variant_answer"
  | "payment_slip"
  | "address"
  | "tracking_request"
  | "unknown";

export type OrderStatus =
  | "draft"
  | "waiting_variant"
  | "confirmed"
  | "reserved_waiting_payment"
  | "paid_waiting_address"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired"
  | "issue";

export type PaymentStatus =
  | "unpaid"
  | "pending_verification"
  | "paid"
  | "partial_paid"
  | "amount_mismatch"
  | "duplicate_slip"
  | "invalid_slip"
  | "expired";

export type MerchantNotificationMode =
  | "off"
  | "important_only"
  | "all"
  | "live_sale_mode";

export interface Merchant {
  id: string;
  name: string;
  email: string;
  taxId?: string;
  createdAt: string;
}

export interface MerchantSettings {
  id: string;
  merchantId: string;
  reservationHoldTimeMinutes: number;
  paymentAccountDisplay: string;
  notificationMode: MerchantNotificationMode;
  liveSaleMode: boolean;
  lowStockThreshold: number;
  enabledChannels: ChannelType[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: ChannelType;
  isActive: boolean;
  config?: Record<string, any>;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  channelType: ChannelType;
  externalCustomerId: string; // ID from LINE/FB etc.
  phone?: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  description?: string;
  imageUrl?: string;
  hasVariants: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // color/size e.g., "Red / L"
  sku: string;
  price: number;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  createdAt: string;
}

export interface IncomingMessage {
  id: string;
  channelType: ChannelType;
  externalMessageId: string;
  externalSenderId: string;
  senderName: string;
  rawContent: string;
  mediaUrl?: string;
  intent?: ParsedOrderIntent;
  status: "pending" | "processed" | "ignored";
  orderId?: string;
  timestamp: string;
}

export interface ParsedOrderIntent {
  id: string;
  messageId: string;
  detectedIntent: OrderIntent;
  confidenceScore: number;
  parsedPayload?: {
    productCode?: string;
    quantity?: number;
    color?: string;
    size?: string;
    slipReference?: string;
    addressText?: string;
    [key: string]: any;
  };
}

export interface Order {
  id: string;
  merchantId: string;
  customerId: string;
  channelType: ChannelType;
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  shippingAddress?: string;
  trackingNumber?: string;
  trackingImageUrl?: string;
  expiresAt?: string; // Expire stock reservation
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentStatus: PaymentStatus;
  amount: number;
  transactionRef?: string;
  transactionTime?: string;
  slipImageUrl?: string;
  slipPayload?: {
    verifiedSuccess?: boolean;
    senderName?: string;
    receivingBank?: string;
    transferredAmount?: number;
    duplicateDetected?: boolean;
    [key: string]: any;
  };
  verifiedAt?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  orderId?: string;
  type: "in" | "out" | "reserve" | "unreserve" | "sale";
  quantity: number;
  note?: string;
  createdAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type:
    | "status_change"
    | "payment_attempt"
    | "shipment_update"
    | "manual_override"
    | "order_detected"
    | "variant_required"
    | "order_confirmed"
    | "stock_reserved"
    | "payment_verified_mock"
    | "address_received"
    | "ready_to_ship"
    | "tracking_added"
    | "human_review_required";
  description: string;
  actor: "system" | "admin" | "customer";
  createdAt: string;
}

export interface MerchantNotification {
  id: string;
  merchantId: string;
  alertLevel: "info" | "warning" | "critical";
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ShippingRecord {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingImageUrl?: string;
  shippedAt?: string;
  status: "pending" | "in_transit" | "delivered" | "failed";
  createdAt: string;
}

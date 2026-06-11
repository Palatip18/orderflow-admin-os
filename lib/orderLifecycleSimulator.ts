import {
  ChannelType,
  ParsedOrderIntent,
  OrderIntent,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentStatus,
  ShippingRecord,
  OrderEvent,
  MerchantSettings
} from "@/types/orderflow";

// Helper helper to generate unique IDs
const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Regex-based parser to detect customer intent, product codes (A001, B002, C003), quantity, color, and size.
 */
export function detectOrderIntent(
  rawText: string,
  channel: ChannelType,
  mockProducts: Product[]
): ParsedOrderIntent {
  const text = rawText.trim();
  let detectedIntent: OrderIntent = "unknown";
  let productCode: string | undefined;
  let quantity = 1;
  let color: string | undefined;
  let size: string | undefined;
  let slipReference: string | undefined;
  let addressText: string | undefined;

  // 1. Detect Intent
  const lowerText = text.toLowerCase();

  // Address pattern
  const hasAddressKeywords = /(ส่งที่|ที่อยู่|บ้านเลขที่|กทม|ถนน|แขวง|เขต|ส่งไปที่)/.test(lowerText) || /\d{5}/.test(lowerText);
  // Slip pattern
  const hasSlipKeywords = /(โอนแล้ว|แนบสลิป|แจ้งโอน|ส่งสลิป)/.test(lowerText) || lowerText.includes("ref");
  
  if (hasAddressKeywords) {
    detectedIntent = "address";
    addressText = text;
  } else if (hasSlipKeywords) {
    detectedIntent = "payment_slip";
    // Mock slip ref
    const refMatch = text.match(/\d{10,}/);
    slipReference = refMatch ? refMatch[0] : `REF-${Date.now()}`;
  } else {
    // Check for buy intent keywords (CF, จอง, เอา, รับ, สั่ง)
    const isBuyIntent = /(cf|เอา|จอง|รับ|สั่ง|ซื้อ|สนใจ)/.test(lowerText) || /([a-c]\d{3})/i.test(lowerText);
    if (isBuyIntent) {
      detectedIntent = "order";
    } else {
      detectedIntent = "product_inquiry";
    }

    // Try parsing catalog SKU: A001, B002, C003
    const skuMatch = text.match(/([A-C]\d{3})/i);
    if (skuMatch) {
      productCode = skuMatch[1].toUpperCase();
    }

    // Try parsing quantity
    const qtyMatch = text.match(/\b(\d+)\b/);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]);
    }

    // Parse Color (e.g., ดำ, ขาว, ทอง, ชมพู, Black, Gold, Pink)
    const colorMatch = text.match(/(ดำ|ขาว|ทอง|ชมพู|black|white|gold|pink|navy|สีกรม)/i);
    if (colorMatch) {
      const match = colorMatch[1].toLowerCase();
      if (match === "ดำ" || match === "black") color = "Black";
      else if (match === "ขาว" || match === "white") color = "White";
      else if (match === "ทอง" || match === "gold") color = "Thai Gold";
      else if (match === "ชมพู" || match === "pink") color = "Rose Pink";
      else if (match === "navy" || match === "สีกรม") color = "Navy";
    }

    // Parse Size (e.g. S, M, L, Free Size)
    const sizeMatch = text.match(/\b(s|m|l|xl|free\s*size|freesize)\b/i);
    if (sizeMatch) {
      const match = sizeMatch[1].toUpperCase();
      if (match.startsWith("FREE")) size = "Free Size";
      else size = match;
    }
  }

  return {
    id: genId("int"),
    messageId: genId("msg"),
    detectedIntent,
    confidenceScore: productCode || addressText || slipReference ? 0.92 : 0.45,
    parsedPayload: {
      productCode,
      quantity,
      color,
      size,
      slipReference,
      addressText,
    },
  };
}

/**
 * Checks physical inventory availability of target products/variants
 */
export function checkProductAvailability(
  parsedIntent: ParsedOrderIntent,
  products: Product[],
  variants: ProductVariant[]
): { available: boolean; product?: Product; variant?: ProductVariant; error?: string } {
  const code = parsedIntent.parsedPayload?.productCode;
  if (!code) {
    return { available: false, error: "No product code specified in message." };
  }

  const product = products.find((p) => p.sku === code);
  if (!product) {
    return { available: false, error: `Product code '${code}' not found in catalog.` };
  }

  // Single-variant checking
  if (!product.hasVariants) {
    const isAvail = product.availableStock >= (parsedIntent.parsedPayload?.quantity || 1);
    return {
      available: isAvail,
      product,
      error: isAvail ? undefined : `Product '${product.name}' is out of stock.`,
    };
  }

  // Multi-variant checking
  const reqColor = parsedIntent.parsedPayload?.color;
  const reqSize = parsedIntent.parsedPayload?.size;

  if (!reqColor || !reqSize) {
    return {
      available: true, // Product exists, variants spec missing
      product,
      error: "Missing variant details (Color/Size required).",
    };
  }

  // Find matching variant
  const matchedVariant = variants.find(
    (v) =>
      v.productId === product.id &&
      v.name.toLowerCase().includes(reqColor.toLowerCase()) &&
      (v.name.toLowerCase().includes(reqSize.toLowerCase()) || reqSize === "Free Size")
  );

  if (!matchedVariant) {
    return {
      available: false,
      product,
      error: `Specified variant (${reqColor} / ${reqSize}) is not available in catalog.`,
    };
  }

  const isAvail = matchedVariant.availableStock >= (parsedIntent.parsedPayload?.quantity || 1);
  return {
    available: isAvail,
    product,
    variant: matchedVariant,
    error: isAvail ? undefined : `Variant '${matchedVariant.name}' is out of stock.`,
  };
}

/**
 * Returns a new draft order based on NLP-regex intents
 */
export function createDraftOrder(
  parsedIntent: ParsedOrderIntent,
  product: Product,
  variant?: ProductVariant,
  customerId: string = "cust_001"
): { order: Order; item: OrderItem } {
  const orderId = genId("ord");
  const quantity = parsedIntent.parsedPayload?.quantity || 1;
  const unitPrice = variant ? variant.price : product.price;
  const totalAmount = unitPrice * quantity;

  const hasMissingVariants = product.hasVariants && !variant;
  const status: OrderStatus = hasMissingVariants ? "waiting_variant" : "confirmed";

  const order: Order = {
    id: orderId,
    merchantId: "mch_001",
    customerId,
    channelType: "line", // fallback
    status,
    totalAmount,
    paidAmount: 0,
    outstandingAmount: totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const item: OrderItem = {
    id: genId("item"),
    orderId,
    productId: product.id,
    variantId: variant?.id,
    quantity,
    unitPrice,
    totalAmount,
  };

  return { order, item };
}

/**
 * Resolves missing colors/sizes and updates order parameters
 */
export function applyVariantAnswer(
  order: Order,
  item: OrderItem,
  variant: ProductVariant
): { order: Order; item: OrderItem } {
  const updatedItem = {
    ...item,
    variantId: variant.id,
    unitPrice: variant.price,
    totalAmount: variant.price * item.quantity,
  };

  const updatedOrder = {
    ...order,
    status: "confirmed" as const,
    totalAmount: updatedItem.totalAmount,
    outstandingAmount: updatedItem.totalAmount,
    updatedAt: new Date().toISOString(),
  };

  return { order: updatedOrder, item: updatedItem };
}

/**
 * Moves confirmed order to reserved state
 */
export function confirmAndReserveOrder(
  order: Order,
  merchantSettings: MerchantSettings
): Order {
  const holdMinutes = merchantSettings.reservationHoldTimeMinutes || 60;
  const expiresAt = new Date(Date.now() + holdMinutes * 60000).toISOString();

  return {
    ...order,
    status: "reserved_waiting_payment",
    expiresAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mock slips verification pipeline
 */
export function mockVerifyPayment(
  order: Order,
  mockSlipStatus: "valid" | "invalid" | "duplicate" | "mismatch"
): { order: Order; payment: Payment } {
  const payId = genId("pay");
  let paymentStatus: PaymentStatus = "unpaid";
  let paidAmount = 0;

  if (mockSlipStatus === "valid") {
    paymentStatus = "paid";
    paidAmount = order.totalAmount;
  } else if (mockSlipStatus === "invalid") {
    paymentStatus = "invalid_slip";
  } else if (mockSlipStatus === "duplicate") {
    paymentStatus = "duplicate_slip";
  } else if (mockSlipStatus === "mismatch") {
    paymentStatus = "amount_mismatch";
    paidAmount = Math.max(0, order.totalAmount - 20); // paid less
  }

  const payment: Payment = {
    id: payId,
    orderId: order.id,
    paymentStatus,
    amount: paidAmount || order.totalAmount,
    transactionRef: `MOCKREF${Date.now()}`,
    transactionTime: new Date().toISOString(),
    slipPayload: {
      verifiedSuccess: mockSlipStatus === "valid",
      transferredAmount: paidAmount || order.totalAmount,
    },
    createdAt: new Date().toISOString(),
  };

  const isSuccessful = paymentStatus === "paid";
  const status: OrderStatus = isSuccessful
    ? (order.shippingAddress ? "ready_to_ship" : "paid_waiting_address")
    : "issue";

  const updatedOrder: Order = {
    ...order,
    status,
    paidAmount,
    outstandingAmount: Math.max(0, order.totalAmount - paidAmount),
    updatedAt: new Date().toISOString(),
  };

  return { order: updatedOrder, payment };
}

/**
 * Capture and store customer shipping addresses
 */
export function collectAddress(order: Order, addressText: string): Order {
  // Address collection must not move an order to ready_to_ship unless the order is already mock payment verified / paid.
  const isPaid = order.paidAmount >= order.totalAmount && order.status === "paid_waiting_address";
  const newStatus: OrderStatus = isPaid ? "ready_to_ship" : order.status;

  return {
    ...order,
    shippingAddress: addressText,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Dispatch / add logistics tracking parameters
 */
export function addTracking(order: Order, trackingNumber: string): { order: Order; shipping: ShippingRecord } {
  const shipId = genId("ship");

  const shipping: ShippingRecord = {
    id: shipId,
    orderId: order.id,
    carrier: "Thailand Post (EMS)",
    trackingNumber,
    shippedAt: new Date().toISOString(),
    status: "in_transit",
    createdAt: new Date().toISOString(),
  };

  const updatedOrder: Order = {
    ...order,
    status: "shipped",
    trackingNumber,
    updatedAt: new Date().toISOString(),
  };

  return { order: updatedOrder, shipping };
}

/**
 * Simple factory utility for OrderEvents logs
 */
export function createOrderEvent(
  orderId: string,
  type: OrderEvent["type"],
  description: string
): OrderEvent {
  return {
    id: genId("evt"),
    orderId,
    type,
    description,
    actor: "system",
    createdAt: new Date().toISOString(),
  };
}

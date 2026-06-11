import {
  detectOrderIntent,
  checkProductAvailability,
  createDraftOrder,
  confirmAndReserveOrder,
  applyVariantAnswer,
  mockVerifyPayment,
  collectAddress,
  createOrderEvent
} from "./orderLifecycleSimulator";
import { mockProducts, mockVariants, mockPaymentProfile } from "./mockData";
import { ParsedOrderIntent, Order, OrderEvent, MerchantNotification, OrderItem } from "@/types/orderflow";
import {
  getPendingLineOrder,
  setPendingLineOrder,
  clearPendingLineOrder,
  PendingLineOrderContext,
  getActiveLinePaymentOrder,
  setActiveLinePaymentOrder,
  clearActiveLinePaymentOrder,
  ActiveLinePaymentOrderContext
} from "./serverSimulationStore";

const defaultSettings = {
  id: "set_001",
  merchantId: "mch_001",
  reservationHoldTimeMinutes: 60,
  paymentAccountDisplay: "กสิกรไทย 123-4-56789-0",
  notificationMode: "all" as const,
  liveSaleMode: false,
  lowStockThreshold: 5,
  enabledChannels: ["line" as const],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function normalizeColor(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/(ขาว|สีขาว|white)/.test(lower)) return "White";
  if (/(ดำ|สีดำ|black)/.test(lower)) return "Black";
  if (/(ชมพู|rose\s*pink|pink)/.test(lower)) return "Rose Pink";
  if (/(กรม|navy|สีกรม)/.test(lower)) return "Navy";
  if (/(ทอง|gold|thai\s*gold)/.test(lower)) return "Thai Gold";
  return undefined;
}

export function normalizeSize(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/(ฟรีไซส์|ฟรีไซด์|freesize|free\s*size|ฟรี)/.test(lower)) return "Free Size";
  
  const cleaned = lower.replace(/[a-c]\d{3}/gi, "");
  
  if (/\bxl\b/.test(cleaned) || cleaned.includes("xl")) return "XL";
  if (/\bs\b/.test(cleaned) || /(^|[^a-z])s([^a-z]|$)/.test(cleaned) || cleaned.includes("ขาว s") || cleaned.includes("ดำ s") || cleaned.includes("ชมพู s") || cleaned.includes("กรม s") || cleaned.includes("ทอง s") || cleaned.includes(" s")) return "S";
  if (/\bm\b/.test(cleaned) || /(^|[^a-z])m([^a-z]|$)/.test(cleaned) || cleaned.includes("ขาว m") || cleaned.includes("ดำ m") || cleaned.includes("ชมพู m") || cleaned.includes("กรม m") || cleaned.includes("ทอง m") || cleaned.includes(" m")) return "M";
  if (/\bl\b/.test(cleaned) || /(^|[^a-z])l([^a-z]|$)/.test(cleaned) || cleaned.includes("ขาว l") || cleaned.includes("ดำ l") || cleaned.includes("ชมพู l") || cleaned.includes("กรม l") || cleaned.includes("ทอง l") || cleaned.includes(" l")) return "L";
  
  return undefined;
}

export function buildPaymentInstructionReply(
  productName: string,
  color: string,
  size: string,
  qty: number,
  total: number,
  profile: typeof mockPaymentProfile
): string {
  const colorText = color ? ` ${color}` : "";
  const sizeText = size ? ` ${size}` : "";
  return `รับออเดอร์จำลองเรียบร้อยค่ะ ${productName}${colorText}${sizeText} จำนวน ${qty} ชิ้น\n\n` +
    `ยอดชำระ: ฿${total}\n\n` +
    `กรุณาโอนเข้าบัญชีจำลอง:\n` +
    `ธนาคาร: ${profile.bankName}\n` +
    `ชื่อบัญชี: ${profile.accountName}\n` +
    `เลขบัญชี: ${profile.accountNumber}\n` +
    `PromptPay: ${profile.promptPayId}\n\n` +
    `หลังโอนแล้ว กรุณาส่งสลิป หรือพิมพ์ “ชำระแล้ว” เพื่อให้ระบบจำลองการตรวจชำระเงินค่ะ\n\n` +
    `หมายเหตุ: ข้อมูลบัญชีนี้เป็นข้อมูลจำลองสำหรับ Alpha testing เท่านั้น`;
}

export function mapLineTextToReply(
  text: string,
  senderId: string,
  activeOrder?: Order,
  orderItem?: OrderItem
): {
  replyText: string;
  intent: ParsedOrderIntent;
  newOrder?: Order;
  newItem?: OrderItem;
  newEvents?: OrderEvent[];
  newNotification?: MerchantNotification;
} {
  const intent = detectOrderIntent(text, "line", mockProducts);
  const parsedColor = normalizeColor(text);
  const parsedSize = normalizeSize(text);
  const code = intent.parsedPayload?.productCode;

  // 1. Detect payment request keywords (e.g. ขอเลข, เลขบัญชี, บัญชี, โอนยังไง, จ่ายยังไง)
  const isPaymentRequest = /(ขอเลข|เลขบัญชี|บัญชี|โอนยังไง|จ่ายยังไง|payment|pay|bank)/i.test(text);
  if (isPaymentRequest && !code && !parsedColor && !parsedSize) {
    const activePayment = getActiveLinePaymentOrder(senderId);
    if (activePayment) {
      const resentInstruction = buildPaymentInstructionReply(
        activePayment.productName,
        activePayment.color,
        activePayment.size,
        activePayment.quantity,
        activePayment.total,
        mockPaymentProfile
      );

      const event = createOrderEvent(
        activePayment.orderId,
        "payment_attempt",
        "ลูกค้าขอเลขบัญชี / ระบบได้ทำการส่งข้อมูลชำระเงินซ้ำ (payment_instruction_resent)"
      );

      return {
        replyText: resentInstruction,
        intent,
        newEvents: [event]
      };
    } else {
      return {
        replyText: "ตอนนี้ยังไม่มีออเดอร์ที่รอชำระเงินค่ะ กรุณาพิมพ์รหัสสินค้า เช่น A001 หรือ CF A001 ขาว S เพื่อเริ่มออเดอร์ก่อนค่ะ",
        intent
      };
    }
  }

  // 2. Handle simulated payment keyword triggers ("ชำระแล้ว", "โอนแล้ว", "ส่งสลิปแล้ว")
  const isMockPaymentConfirmation = /(ชำระแล้ว|โอนแล้ว|ส่งสลิปแล้ว)/.test(text);
  if (isMockPaymentConfirmation && !code) {
    const activePayment = getActiveLinePaymentOrder(senderId);
    // Find the actual order object in context if possible
    if (activeOrder && activeOrder.status === "reserved_waiting_payment") {
      const { order: updatedOrder, payment } = mockVerifyPayment(activeOrder, "valid");
      const event1 = createOrderEvent(updatedOrder.id, "payment_verified_mock", `จำลองการตรวจสอบสลิปสำเร็จ (ยอดเงิน ${payment.amount} บาท)`);
      const event2 = createOrderEvent(updatedOrder.id, "status_change", `เปลี่ยนสถานะเป็น ${updatedOrder.status === "ready_to_ship" ? "พร้อมส่ง" : "ชำระเงินแล้ว/รอที่อยู่"}`);

      const notif: MerchantNotification = {
        id: `notif_${Math.random().toString(36).substr(2, 9)}`,
        merchantId: "mch_001",
        alertLevel: "info",
        message: `ได้รับยอดชำระเงินจาก LINE แล้ว ${payment.amount} บาท`,
        orderId: updatedOrder.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const replyText = updatedOrder.status === "ready_to_ship"
        ? "ได้รับยอดโอนและที่อยู่เรียบร้อยค่ะ ระบบได้เปลี่ยนสถานะเป็นพร้อมส่งแล้วค่ะ"
        : "ได้รับยอดโอนเรียบร้อยค่ะ กรุณาพิมพ์แจ้งที่อยู่สำหรับจัดส่งสินค้าด้วยค่ะ";

      clearActiveLinePaymentOrder(senderId);

      return {
        replyText,
        intent,
        newOrder: updatedOrder,
        newEvents: [event1, event2],
        newNotification: notif
      };
    } else if (activePayment) {
      // Fallback if activeOrder is not passed correctly but activePayment exists
      return {
        replyText: "ได้รับแจ้งโอนเงินจำลองแล้วค่ะ กรุณารอระบบตรวจสอบ หรือพิมพ์แจ้งที่อยู่จัดส่งได้เลยค่ะ",
        intent
      };
    }
  }

  // 3. STATEFUL CONTEXT CHECK: User sent variants without product code, check if there is a pending variant context
  if (!code && (parsedColor || parsedSize)) {
    const pendingContext = getPendingLineOrder(senderId);
    if (pendingContext) {
      const product = mockProducts.find((p) => p.sku === pendingContext.productCode);
      if (product) {
        const color = parsedColor || "";
        const size = parsedSize || "";

        const matchedVariant = mockVariants.find(
          (v) =>
            v.productId === product.id &&
            v.name.toLowerCase().includes(color.toLowerCase()) &&
            (v.name.toLowerCase().includes(size.toLowerCase()) || size === "Free Size")
        );

        if (!matchedVariant) {
          const availableVariants = mockVariants
            .filter((v) => v.productId === product.id)
            .map((v) => v.name)
            .join(", ");
          return {
            replyText: `พบสินค้า ${product.name} ค่ะ แต่สี/ไซด์ที่เลือกยังไม่มีใน catalog จำลอง กรุณาเลือกจากตัวเลือกที่มี: ${availableVariants} ค่ะ`,
            intent
          };
        }

        const forcedIntent = {
          ...intent,
          parsedPayload: {
            ...intent.parsedPayload,
            productCode: product.sku,
            color,
            size,
            quantity: pendingContext.quantity
          }
        };

        const { order: draftOrder, item: draftItem } = createDraftOrder(forcedIntent, product, matchedVariant, senderId);
        const reservedOrder = confirmAndReserveOrder(draftOrder, defaultSettings);

        const event1 = createOrderEvent(reservedOrder.id, "variant_required", `ลูกค้าระบุรายละเอียดสินค้าเพิ่มเติม: ${matchedVariant.name}`);
        const event2 = createOrderEvent(reservedOrder.id, "order_confirmed", `ยืนยันออเดอร์จำลองรหัสสินค้า ${product.sku}`);
        const event3 = createOrderEvent(reservedOrder.id, "stock_reserved", `จำลองการจองสินค้า: ${product.name} (${matchedVariant.name})`);
        const event4 = createOrderEvent(reservedOrder.id, "payment_attempt", "ส่งข้อมูลการชำระเงินให้ลูกค้า (payment_instruction_sent)");

        const notif: MerchantNotification = {
          id: `notif_${Math.random().toString(36).substr(2, 9)}`,
          merchantId: "mch_001",
          alertLevel: "info",
          message: `ออเดอร์ใหม่จาก LINE: ${product.name} ${color} ${size} ${pendingContext.quantity} ชิ้น`,
          orderId: reservedOrder.id,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        clearPendingLineOrder(senderId);

        // Set active payment context tracking
        setActiveLinePaymentOrder(senderId, {
          lineUserId: senderId,
          orderId: reservedOrder.id,
          productName: product.name,
          productCode: product.sku,
          color,
          size,
          quantity: pendingContext.quantity,
          total: reservedOrder.totalAmount,
          paymentStatus: "unpaid",
          createdAt: new Date().toISOString()
        });

        const replyText = buildPaymentInstructionReply(
          product.name,
          color,
          size,
          pendingContext.quantity,
          reservedOrder.totalAmount,
          mockPaymentProfile
        );

        return {
          replyText,
          intent: forcedIntent,
          newOrder: reservedOrder,
          newItem: draftItem,
          newEvents: [event1, event2, event3, event4],
          newNotification: notif
        };
      }
    }
  }

  // 4. Handle address intent
  if (intent.detectedIntent === "address") {
    if (activeOrder && (activeOrder.status === "paid_waiting_address" || activeOrder.status === "reserved_waiting_payment")) {
      const addressText = intent.parsedPayload?.addressText || text;
      const updatedOrder = collectAddress(activeOrder, addressText);
      const event1 = createOrderEvent(updatedOrder.id, "address_received", `บันทึกที่อยู่จัดส่ง: ${updatedOrder.shippingAddress}`);
      const newEvents = [event1];

      if (updatedOrder.status === "ready_to_ship") {
        newEvents.push(createOrderEvent(updatedOrder.id, "ready_to_ship", `เตรียมสินค้าพร้อมจัดส่ง`));
      }

      const replyText = updatedOrder.status === "ready_to_ship"
        ? "ได้รับที่อยู่เรียบร้อยค่ะ ระบบได้เปลี่ยนสถานะเป็นพร้อมส่งแล้วค่ะ"
        : "ได้รับที่อยู่เรียบร้อยค่ะ ระบบจะดำเนินการต่อเมื่อได้รับการยืนยันการชำระเงินค่ะ";

      return {
        replyText,
        intent,
        newOrder: updatedOrder,
        newEvents
      };
    } else {
      return {
        replyText: "ได้รับข้อมูลที่อยู่แล้วค่ะ แต่ระบบยังไม่พบออเดอร์ที่รอจัดส่งของคุณในขณะนี้ค่ะ",
        intent
      };
    }
  }

  // 5. Handle payment slip intent
  if (intent.detectedIntent === "payment_slip") {
    if (activeOrder && activeOrder.status === "reserved_waiting_payment") {
      const { order: updatedOrder, payment } = mockVerifyPayment(activeOrder, "valid");
      const event1 = createOrderEvent(updatedOrder.id, "payment_verified_mock", `จำลองการตรวจสอบสลิปสำเร็จ (ยอดเงิน ${payment.amount} บาท)`);
      const event2 = createOrderEvent(updatedOrder.id, "status_change", `เปลี่ยนสถานะเป็น ${updatedOrder.status === "ready_to_ship" ? "พร้อมส่ง" : "ชำระเงินแล้ว/รอที่อยู่"}`);

      const notif: MerchantNotification = {
        id: `notif_${Math.random().toString(36).substr(2, 9)}`,
        merchantId: "mch_001",
        alertLevel: "info",
        message: `ได้รับยอดชำระเงินจาก LINE แล้ว ${payment.amount} บาท`,
        orderId: updatedOrder.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const replyText = updatedOrder.status === "ready_to_ship"
        ? "ได้รับยอดโอนและที่อยู่เรียบร้อยค่ะ ระบบได้เปลี่ยนสถานะเป็นพร้อมส่งแล้วค่ะ"
        : "ได้รับยอดโอนเรียบร้อยค่ะ กรุณาพิมพ์แจ้งที่อยู่สำหรับจัดส่งสินค้าด้วยค่ะ";

      clearActiveLinePaymentOrder(senderId);

      return {
        replyText,
        intent,
        newOrder: updatedOrder,
        newEvents: [event1, event2],
        newNotification: notif
      };
    } else {
      return {
        replyText: "ได้รับรูปภาพหรือหลักฐานการโอนเงินแล้วค่ะ แต่ระบบยังไม่พบออเดอร์ที่รอชำระเงินของคุณ กรุณาสั่งซื้อสินค้าก่อนนะคะ",
        intent
      };
    }
  }

  // 6. Handle standard catalog product codes
  if (!code) {
    return {
      replyText: "ระบบได้รับข้อความแล้วค่ะ แต่ยังไม่สามารถแปลงเป็นออเดอร์ได้ชัดเจน กรุณาพิมพ์รหัสสินค้า เช่น A001 หรือ CF A001 ขาว S ค่ะ",
      intent
    };
  }

  const product = mockProducts.find((p) => p.sku === code);
  if (!product) {
    return {
      replyText: "ขออภัยค่ะ ระบบยังไม่พบรหัสสินค้านี้ใน catalog จำลอง กรุณาตรวจสอบรหัสสินค้าอีกครั้ง หรือรอแอดมินตรวจสอบค่ะ",
      intent
    };
  }

  if (product.hasVariants) {
    if (!parsedColor || !parsedSize) {
      const qty = intent.parsedPayload?.quantity || 1;
      const newContext: PendingLineOrderContext = {
        lineUserId: senderId,
        productCode: product.sku,
        productId: product.id,
        productName: product.name,
        quantity: qty,
        sourceIncomingMessageId: intent.messageId,
        createdAt: new Date().toISOString(),
        status: "waiting_variant"
      };
      setPendingLineOrder(senderId, newContext);

      return {
        replyText: `พบสินค้า ${product.name} รหัส ${product.sku} ค่ะ ตอนนี้ยังมีสินค้า กรุณาระบุสีและไซด์ที่ต้องการ เช่น 'ขาว S' เพื่อให้ระบบจำลองการยืนยันออเดอร์ต่อค่ะ`,
        intent
      };
    }

    const matchedVariant = mockVariants.find(
      (v) =>
        v.productId === product.id &&
        v.name.toLowerCase().includes(parsedColor.toLowerCase()) &&
        (v.name.toLowerCase().includes(parsedSize.toLowerCase()) || parsedSize === "Free Size")
    );

    if (!matchedVariant) {
      const availableVariants = mockVariants
        .filter((v) => v.productId === product.id)
        .map((v) => v.name)
        .join(", ");
      return {
        replyText: `พบสินค้า ${product.name} ค่ะ แต่สี/ไซด์ที่เลือกยังไม่มีใน catalog จำลอง กรุณาเลือกจากตัวเลือกที่มี: ${availableVariants} ค่ะ`,
        intent
      };
    }

    const qty = intent.parsedPayload?.quantity || 1;
    const isAvail = matchedVariant.availableStock >= qty;

    if (!isAvail) {
      return {
        replyText: `ขออภัยค่ะ สินค้า ${product.name} รหัส ${product.sku} ที่ต้องการหมดชั่วคราวค่ะ`,
        intent
      };
    }

    const forcedIntent = {
      ...intent,
      parsedPayload: {
        ...intent.parsedPayload,
        color: parsedColor,
        size: parsedSize,
        quantity: qty
      }
    };

    const { order: draftOrder, item: draftItem } = createDraftOrder(forcedIntent, product, matchedVariant, senderId);
    const reservedOrder = confirmAndReserveOrder(draftOrder, defaultSettings);

    const event1 = createOrderEvent(reservedOrder.id, "order_detected", `พบความต้องการสั่งซื้อ: ${product.name}`);
    const event2 = createOrderEvent(reservedOrder.id, "order_confirmed", `ยืนยันออเดอร์จำลองรหัสสินค้า ${product.sku}`);
    const event3 = createOrderEvent(reservedOrder.id, "stock_reserved", `จำลองการจองสินค้า: ${product.name}`);
    const event4 = createOrderEvent(reservedOrder.id, "payment_attempt", "ส่งข้อมูลการชำระเงินให้ลูกค้า (payment_instruction_sent)");

    const notif: MerchantNotification = {
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      merchantId: "mch_001",
      alertLevel: "info",
      message: `ออเดอร์ใหม่จาก LINE: ${product.name} ${parsedColor} ${parsedSize} ${qty} ชิ้น`,
      orderId: reservedOrder.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    clearPendingLineOrder(senderId);

    // Set active payment context tracking
    setActiveLinePaymentOrder(senderId, {
      lineUserId: senderId,
      orderId: reservedOrder.id,
      productName: product.name,
      productCode: product.sku,
      color: parsedColor,
      size: parsedSize,
      quantity: qty,
      total: reservedOrder.totalAmount,
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString()
    });

    const replyText = buildPaymentInstructionReply(
      product.name,
      parsedColor,
      parsedSize,
      qty,
      reservedOrder.totalAmount,
      mockPaymentProfile
    );

    return {
      replyText,
      intent: forcedIntent,
      newOrder: reservedOrder,
      newItem: draftItem,
      newEvents: [event1, event2, event3, event4],
      newNotification: notif
    };
  }

  // Product has no variants
  const qty = intent.parsedPayload?.quantity || 1;
  const isAvail = product.availableStock >= qty;

  if (!isAvail) {
    return {
      replyText: `ขออภัยค่ะ สินค้า ${product.name} รหัส ${product.sku} ที่ต้องการหมดชั่วคราวค่ะ`,
      intent
    };
  }

  const { order: draftOrder, item: draftItem } = createDraftOrder(intent, product, undefined, senderId);
  const reservedOrder = confirmAndReserveOrder(draftOrder, defaultSettings);

  const event1 = createOrderEvent(reservedOrder.id, "order_detected", `พบความต้องการสั่งซื้อ: ${product.name}`);
  const event2 = createOrderEvent(reservedOrder.id, "order_confirmed", `ยืนยันออเดอร์จำลองรหัสสินค้า ${product.sku}`);
  const event3 = createOrderEvent(reservedOrder.id, "stock_reserved", `จำลองการจองสินค้า: ${product.name}`);
  const event4 = createOrderEvent(reservedOrder.id, "payment_attempt", "ส่งข้อมูลการชำระเงินให้ลูกค้า (payment_instruction_sent)");

  const notif: MerchantNotification = {
    id: `notif_${Math.random().toString(36).substr(2, 9)}`,
    merchantId: "mch_001",
    alertLevel: "info",
    message: `ออเดอร์ใหม่จาก LINE: ${product.name} ${qty} ชิ้น`,
    orderId: reservedOrder.id,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  clearPendingLineOrder(senderId);

  // Set active payment context tracking
  setActiveLinePaymentOrder(senderId, {
    lineUserId: senderId,
    orderId: reservedOrder.id,
    productName: product.name,
    productCode: product.sku,
    color: "",
    size: "",
    quantity: qty,
    total: reservedOrder.totalAmount,
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString()
  });

  const replyText = buildPaymentInstructionReply(
    product.name,
    "",
    "",
    qty,
    reservedOrder.totalAmount,
    mockPaymentProfile
  );

  return {
    replyText,
    intent,
    newOrder: reservedOrder,
    newItem: draftItem,
    newEvents: [event1, event2, event3, event4],
    newNotification: notif
  };
}

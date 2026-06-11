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
import { mockProducts, mockVariants } from "./mockData";
import { ParsedOrderIntent, Order, OrderEvent, MerchantNotification, OrderItem } from "@/types/orderflow";

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
  // 1. Detect Intent using the existing rule-based parser logic
  const intent = detectOrderIntent(text, "line", mockProducts);

  // Check if we have an active order waiting for variant details, and the user provided details but not product SKU
  if (activeOrder && activeOrder.status === "waiting_variant" && orderItem) {
    const hasColorOrSize = intent.parsedPayload?.color || intent.parsedPayload?.size;
    const hasNoProductCode = !intent.parsedPayload?.productCode;

    if (hasColorOrSize && hasNoProductCode) {
      const product = mockProducts.find((p) => p.id === orderItem.productId);
      if (product) {
        // Re-run intent parser forcing the active order's product SKU
        const forcedText = `CF ${product.sku} ${text}`;
        const reParsed = detectOrderIntent(forcedText, "line", mockProducts);
        const result = checkProductAvailability(reParsed, mockProducts, mockVariants);

        if (result.variant) {
          const { order: updatedOrder, item: updatedItem } = applyVariantAnswer(activeOrder, orderItem, result.variant);
          const reservedOrder = confirmAndReserveOrder(updatedOrder, defaultSettings);

          const event1 = createOrderEvent(reservedOrder.id, "variant_required", `ลูกค้าระบุรายละเอียดสินค้าเพิ่มเติม: ${result.variant.name}`);
          const event2 = createOrderEvent(reservedOrder.id, "order_confirmed", `ยืนยันออเดอร์จำลองรหัสสินค้า ${product.sku}`);
          const event3 = createOrderEvent(reservedOrder.id, "stock_reserved", `จำลองการจองสินค้า: ${product.name} (${result.variant.name})`);

          const color = result.variant.name.split(" / ")[0] || "";
          const size = result.variant.name.split(" / ")[1] || "";

          const notif: MerchantNotification = {
            id: `notif_${Math.random().toString(36).substr(2, 9)}`,
            merchantId: "mch_001",
            alertLevel: "info",
            message: `ออเดอร์ใหม่จาก LINE: ${product.name} ${color} ${size} 1 ชิ้น`,
            orderId: reservedOrder.id,
            isRead: false,
            createdAt: new Date().toISOString()
          };

          return {
            replyText: `รับออเดอร์จำลองเรียบร้อยค่ะ ${product.name} ${color} ${size} จำนวน ${updatedItem.quantity} ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`,
            intent: reParsed,
            newOrder: reservedOrder,
            newItem: updatedItem,
            newEvents: [event1, event2, event3],
            newNotification: notif
          };
        }
      }
    }
  }

  // Handle address intent
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

  // Handle payment slip intent
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

  const code = intent.parsedPayload?.productCode;

  // Case D: Unknown/no product code found
  if (!code) {
    return {
      replyText: "ระบบได้รับข้อความแล้วค่ะ แต่ยังไม่สามารถแปลงเป็นออเดอร์ได้ชัดเจน กรุณาพิมพ์รหัสสินค้า เช่น A001 หรือ CF A001 ขาว S ค่ะ",
      intent
    };
  }

  // Look up product in mock catalog
  const product = mockProducts.find((p) => p.sku === code);
  
  // Case C: Product code not found in mock catalog
  if (!product) {
    return {
      replyText: "ขออภัยค่ะ ระบบยังไม่พบรหัสสินค้านี้ใน catalog จำลอง กรุณาตรวจสอบรหัสสินค้าอีกครั้ง หรือรอแอดมินตรวจสอบค่ะ",
      intent
    };
  }

  // Check stock availability and variants
  const result = checkProductAvailability(intent, mockProducts, mockVariants);

  // Case A: Product found, but variants color/size details are missing
  if (product.hasVariants && !result.variant) {
    const { order: draftOrder, item: draftItem } = createDraftOrder(intent, product, undefined, senderId);
    const event = createOrderEvent(draftOrder.id, "variant_required", `พบสินค้า ${product.name} แต่ยังขาดการระบุสี/ไซส์`);

    return {
      replyText: `พบสินค้า ${product.name} รหัส ${product.sku} ค่ะ ตอนนี้ยังมีสินค้า กรุณาระบุสีและไซด์ที่ต้องการ เช่น 'ขาว S' เพื่อให้ระบบจำลองการยืนยันออเดอร์ต่อค่ะ`,
      intent,
      newOrder: draftOrder,
      newItem: draftItem,
      newEvents: [event]
    };
  }

  // Case B: Product code found and variant details/quantity are complete
  const isAvail = result.variant
    ? result.variant.availableStock >= (intent.parsedPayload?.quantity || 1)
    : product.availableStock >= (intent.parsedPayload?.quantity || 1);

  if (!isAvail) {
    return {
      replyText: `ขออภัยค่ะ สินค้า ${product.name} รหัส ${product.sku} ที่ต้องการหมดชั่วคราวค่ะ`,
      intent
    };
  }

  const { order: draftOrder, item: draftItem } = createDraftOrder(intent, product, result.variant, senderId);
  const reservedOrder = confirmAndReserveOrder(draftOrder, defaultSettings);

  const event1 = createOrderEvent(reservedOrder.id, "order_detected", `พบความต้องการสั่งซื้อ: ${product.name}`);
  const event2 = createOrderEvent(reservedOrder.id, "order_confirmed", `ยืนยันออเดอร์จำลองรหัสสินค้า ${product.sku}`);
  const event3 = createOrderEvent(reservedOrder.id, "stock_reserved", `จำลองการจองสินค้า: ${product.name}`);

  const color = result.variant ? result.variant.name.split(" / ")[0] : "";
  const size = result.variant ? result.variant.name.split(" / ")[1] : "";
  const qty = intent.parsedPayload?.quantity || 1;

  const notif: MerchantNotification = {
    id: `notif_${Math.random().toString(36).substr(2, 9)}`,
    merchantId: "mch_001",
    alertLevel: "info",
    message: `ออเดอร์ใหม่จาก LINE: ${product.name} ${color} ${size} ${qty} ชิ้น`,
    orderId: reservedOrder.id,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  return {
    replyText: `รับออเดอร์จำลองเรียบร้อยค่ะ ${product.name} ${color} ${size} จำนวน ${qty} ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`,
    intent,
    newOrder: reservedOrder,
    newItem: draftItem,
    newEvents: [event1, event2, event3],
    newNotification: notif
  };
}

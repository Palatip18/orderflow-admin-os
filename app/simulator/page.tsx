"use client";

import React, { useState, useEffect } from "react";
import { mockProducts, mockVariants, mockSettings, mockCustomers } from "@/lib/mockData";
import {
  detectOrderIntent,
  checkProductAvailability,
  createDraftOrder,
  applyVariantAnswer,
  confirmAndReserveOrder,
  mockVerifyPayment,
  collectAddress,
  addTracking,
  createOrderEvent
} from "@/lib/orderLifecycleSimulator";
import {
  addSimulatedOrder,
  addSimulatedEvent,
  addSimulatedNotification,
  resetSimulationState,
  getSimulatedOrders,
  addSimulatedOrderItem,
  addSimulatedStockMovement,
  addSimulatedIncomingMessage,
  getSimulatedIncomingMessages,
  saveSimulatedIncomingMessages
} from "@/lib/localOrderState";
import { ChannelType, ParsedOrderIntent, Order, OrderItem, ProductVariant, OrderEvent, Product, IncomingMessage } from "@/types/orderflow";
import { CHANNEL_LABELS } from "@/lib/statusLabels";
import SimulationNotice from "@/components/SimulationNotice";
import SimulatorStepCard from "@/components/SimulatorStepCard";
import ParsedIntentCard from "@/components/ParsedIntentCard";
import OrderLifecycleTimeline from "@/components/OrderLifecycleTimeline";

const PRESET_MESSAGES: { channel: ChannelType; text: string; label: string }[] = [
  { channel: "line", text: "สนใจกางเกงช้างครับ A001", label: "LINE: สนใจ A001 (ยังไม่เลือกสี/ไซส์)" },
  { channel: "facebook_live", text: "A001 ดำ 1 ตัวครับ", label: "FB Live: สั่ง A001 สีดำ (ข้อมูลครบ)" },
  { channel: "instagram_dm", text: "สั่งเดรสผ้าไหม B002 สีทอง ไซส์ M 1 ชุดค่ะ", label: "IG DM: สั่ง B002 สีทอง M (ข้อมูลครบ)" },
  { channel: "tiktok_live", text: "เอาเสื้อ B002 2 ชิ้นครับ", label: "TikTok: สั่ง B002 (ยังไม่เลือกสี/ไซส์)" },
  { channel: "web_order", text: "สั่งกระเป๋า C003 1 ชิ้นค่ะ", label: "Web Link: สั่ง C003 (สินค้าไม่มีตัวเลือก)" }
];

export default function SimulatorPage() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("line");
  const [inputText, setInputText] = useState("สนใจกางเกงช้างครับ A001");
  const [currentStep, setCurrentStep] = useState(1);

  // Simulation State
  const [activeIntent, setActiveIntent] = useState<ParsedOrderIntent | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeItem, setActiveItem] = useState<OrderItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeEvents, setActiveEvents] = useState<OrderEvent[]>([]);

  // Workflow helpers
  const [variantOptions, setVariantOptions] = useState<ProductVariant[]>([]);
  const [stockStatus, setStockStatus] = useState<{ available: boolean; error?: string } | null>(null);
  const [slipQuality, setSlipQuality] = useState<"valid" | "invalid" | "duplicate" | "mismatch">("valid");
  const [addressInput, setAddressInput] = useState("สมชาย ใจดี 12/34 ถนนสุขุมวิท คลองเตย กทม. 10110 โทร 081-234-5678");
  const [trackingInput, setTrackingInput] = useState("TH1290382910A");

  const steps = [
    { id: 1, label: "ข้อความเข้า (Message Intake)" },
    { id: 2, label: "ตรวจสอบสต็อก (Variant & Stock)" },
    { id: 3, label: "จองและชำระเงิน (Reserve & Payment)" },
    { id: 4, label: "ที่อยู่และจัดส่ง (Address & Dispatch)" }
  ];

  // Load active simulation states if any existed in memory
  const handleSelectPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setSelectedChannel(preset.channel);
    setInputText(preset.text);
  };

  const handleReset = () => {
    resetSimulationState();
    setActiveIntent(null);
    setActiveMessageId(null);
    setActiveOrder(null);
    setActiveItem(null);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setActiveEvents([]);
    setStockStatus(null);
    setVariantOptions([]);
    setCurrentStep(1);
  };

  // Step 1: Parsing
  const handleDetectIntent = () => {
    const intent = detectOrderIntent(inputText, selectedChannel, mockProducts);
    setActiveIntent(intent);

    const msgId = `msg_${Date.now()}`;
    setActiveMessageId(msgId);

    // Save simulated incoming message to localStorage
    const incomingMessage: IncomingMessage = {
      id: msgId,
      channelType: selectedChannel,
      externalMessageId: `ext_msg_${Date.now()}`,
      externalSenderId: `cust_${Date.now()}`,
      senderName: selectedChannel === "line"
        ? "สมชาย (LINE)"
        : selectedChannel === "facebook_live"
        ? "สมศรี (FB Live)"
        : selectedChannel === "facebook_messenger"
        ? "สมศักดิ์ (FB Messenger)"
        : selectedChannel === "instagram_dm"
        ? "สมหญิง (IG DM)"
        : selectedChannel === "tiktok_live"
        ? "สมหวัง (TikTok Live)"
        : "ลูกค้าจำลอง (Simulator)",
      rawContent: inputText,
      intent: intent,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    addSimulatedIncomingMessage(incomingMessage);

    // Create event log
    const event = createOrderEvent(intent.id, "order_detected", `ตรวจพบข้อความจากลูกค้าผ่านทางช่องทางจำลอง ${CHANNEL_LABELS[selectedChannel].label}: "${inputText}"`);
    setActiveEvents([event]);

    // Check catalog matching
    const code = intent.parsedPayload?.productCode;
    const matchedProd = mockProducts.find((p) => p.sku === code);
    
    if (matchedProd) {
      setSelectedProduct(matchedProd);
      // Check stock
      const result = checkProductAvailability(intent, mockProducts, mockVariants);
      setStockStatus({ available: result.available, error: result.error });

      if (result.variant) {
        setSelectedVariant(result.variant);
      }

      if (matchedProd.hasVariants && !result.variant) {
        // Find variant options to show selector
        const options = mockVariants.filter((v) => v.productId === matchedProd.id);
        setVariantOptions(options);
      }

      // Advance to step 2
      setCurrentStep(2);
    } else {
      setStockStatus({ available: false, error: `ไม่พบรหัสสินค้า '${code || "unknown"}' ในระบบสินค้า` });
      const errorEvent = createOrderEvent(intent.id, "human_review_required", `การตรวจสอบสินค้าล้มเหลว: ไม่พบรหัสสินค้า '${code || "unknown"}' ย้ายข้อมูลไปยังคิวตรวจสอบด้วยมือ (Human Review Queue)`);
      setActiveEvents((prev) => [errorEvent, ...prev]);
      setCurrentStep(2);
    }
  };

  // Step 2: Variant Specification
  const handleChooseVariant = (variant: ProductVariant) => {
    if (!activeIntent || !selectedProduct) return;
    setSelectedVariant(variant);
    setStockStatus({ available: variant.availableStock > 0 });

    const variantEvent = createOrderEvent(activeIntent.id, "variant_required", `ลูกค้าตอบตัวเลือกสินค้าเป็น '${variant.name}'`);
    setActiveEvents((prev) => [variantEvent, ...prev]);
  };

  const handleCreateDraft = () => {
    if (!activeIntent || !selectedProduct) return;

    // Reservation Rule Guard: Ensure variant is selected if the product has variants
    if (selectedProduct.hasVariants && !selectedVariant) {
      alert("กรุณาเลือกตัวเลือกสินค้าก่อนดำเนินการจอง");
      return;
    }
    
    // Create draft
    const { order, item } = createDraftOrder(activeIntent, selectedProduct, selectedVariant || undefined);
    order.channelType = selectedChannel;
    
    // If order has variants but none specified, keep waiting_variant, otherwise confirmed
    setActiveOrder(order);
    setActiveItem(item);

    const draftEvent = createOrderEvent(order.id, "status_change", `สร้างร่างออเดอร์สำเร็จ สถานะปัจจุบัน: ${order.status}`);
    setActiveEvents((prev) => [draftEvent, ...prev]);
    
    // Auto advance to reserve payment step
    const reservedOrder = confirmAndReserveOrder(order, mockSettings);
    setActiveOrder(reservedOrder);

    // Record simulated stock reservation movement
    const reservationMovement = {
      id: `stk_${Date.now()}`,
      productId: selectedProduct.id,
      variantId: selectedVariant?.id || undefined,
      orderId: order.id,
      type: "reserve" as const,
      quantity: item.quantity,
      note: "Simulated stock reservation",
      createdAt: new Date().toISOString()
    };

    // Add to LocalStorage
    addSimulatedOrderItem(item);
    addSimulatedStockMovement(reservationMovement);
    addSimulatedOrder(reservedOrder);
    addSimulatedEvent(draftEvent);

    // Link simulated message to order
    if (activeMessageId) {
      const msgs = getSimulatedIncomingMessages();
      const updatedMsgs = msgs.map((m) => {
        if (m.id === activeMessageId) {
          return { ...m, status: "processed" as const, orderId: order.id };
        }
        return m;
      });
      saveSimulatedIncomingMessages(updatedMsgs);
    }

    const reserveEvent = createOrderEvent(order.id, "stock_reserved", `ระบบจองสินค้าจำนวน ${item.quantity} รายการแล้ว ระยะเวลาจองจะหมดอายุเวลา: ${new Date(reservedOrder.expiresAt || "").toLocaleTimeString()}`);
    setActiveEvents((prev) => [reserveEvent, ...prev]);
    addSimulatedEvent(reserveEvent);

    // In-app alert
    addSimulatedNotification({
      id: `not_${Date.now()}`,
      merchantId: "mch_001",
      alertLevel: "info",
      message: `ระบบจำลองทำการล็อคคลังสินค้าสำหรับออเดอร์ #${order.id} ผ่าน ${CHANNEL_LABELS[selectedChannel].label} เรียบร้อย`,
      orderId: order.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    setCurrentStep(3);
  };

  // Step 3: Payment
  const handleVerifyPayment = () => {
    if (!activeOrder) return;

    const { order, payment } = mockVerifyPayment(activeOrder, slipQuality);
    setActiveOrder(order);

    const verifyEvent = createOrderEvent(
      order.id,
      "payment_verified_mock",
      `จำลองการสแกนสลิปโอนเงินสำเร็จ ตรวจพบเลขอ้างอิงสลิป: ${payment.transactionRef}. ผลลัพธ์: ${payment.paymentStatus}`
    );
    setActiveEvents((prev) => [verifyEvent, ...prev]);
    addSimulatedEvent(verifyEvent);

    if (order.status === "issue") {
      const issueEvent = createOrderEvent(order.id, "human_review_required", `ระบบจำลองตรวจพบปัญหายอดชำระเงิน: ${payment.paymentStatus} จำเป็นต้องให้แอดมินตรวจสอบ`);
      setActiveEvents((prev) => [issueEvent, ...prev]);
      addSimulatedEvent(issueEvent);

      addSimulatedNotification({
        id: `not_${Date.now()}`,
        merchantId: "mch_001",
        alertLevel: "critical",
        message: `ออเดอร์ #${order.id} ตรวจพบความผิดปกติในการชำระเงิน: ${payment.paymentStatus}`,
        orderId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else {
      addSimulatedNotification({
        id: `not_${Date.now()}`,
        merchantId: "mch_001",
        alertLevel: "info",
        message: `ออเดอร์ #${order.id} ตรวจสอบการชำระเงินจำลองผ่านแล้ว อยู่ระหว่างรอข้อมูลที่อยู่ผู้รับ`,
        orderId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Sync to local order state
    addSimulatedOrder(order);
    setCurrentStep(4);
  };

  // Step 4: Address and Logistics
  const handleSubmitAddress = () => {
    if (!activeOrder) return;

    const updatedOrder = collectAddress(activeOrder, addressInput);
    setActiveOrder(updatedOrder);

    const addressEvent = createOrderEvent(updatedOrder.id, "address_received", `บันทึกที่อยู่จัดส่งของลูกค้าแล้ว: "${addressInput}"`);
    setActiveEvents((prev) => [addressEvent, ...prev]);
    addSimulatedEvent(addressEvent);

    if (updatedOrder.status === "ready_to_ship") {
      const readyEvent = createOrderEvent(updatedOrder.id, "ready_to_ship", "ย้ายออเดอร์เข้าสู่คิวเตรียมพร้อมจัดส่งสินค้าสำเร็จ");
      setActiveEvents((prev) => [readyEvent, ...prev]);
      addSimulatedEvent(readyEvent);
    }

    addSimulatedOrder(updatedOrder);
  };

  const handleAddTracking = () => {
    if (!activeOrder) return;

    const { order, shipping } = addTracking(activeOrder, trackingInput);
    setActiveOrder(order);

    const trackingEvent = createOrderEvent(order.id, "tracking_added", `บันทึกหมายเลขพัสดุและจัดส่งแล้ว: ${trackingInput} (${shipping.carrier})`);
    setActiveEvents((prev) => [trackingEvent, ...prev]);
    addSimulatedEvent(trackingEvent);

    const completeEvent = createOrderEvent(order.id, "status_change", "ออเดอร์ถูกส่งต่อไปยังขนส่งเรียบร้อย");
    setActiveEvents((prev) => [completeEvent, ...prev]);
    addSimulatedEvent(completeEvent);

    // Record simulated stock sale movement (reserve released to complete sale)
    if (selectedProduct) {
      const saleMovement = {
        id: `stk_${Date.now()}`,
        productId: selectedProduct.id,
        variantId: selectedVariant?.id || undefined,
        orderId: order.id,
        type: "sale" as const,
        quantity: activeItem?.quantity || 1,
        note: "Simulated stock sale transition",
        createdAt: new Date().toISOString()
      };
      addSimulatedStockMovement(saleMovement);
    }

    addSimulatedOrder(order);

    addSimulatedNotification({
      id: `not_${Date.now()}`,
      merchantId: "mch_001",
      alertLevel: "info",
      message: `ออเดอร์ #${order.id} จัดส่งสำเร็จแล้ว. เลขพัสดุ: ${trackingInput}`,
      orderId: order.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">จำลองขั้นตอนรับออเดอร์</h1>
          <p className="text-sm text-slate-400">หน้านี้เป็นตัวจำลอง workflow เท่านั้น ยังไม่มีการเชื่อมต่อช่องทางขาย, payment API, SlipOK, AI หรือระบบขนส่งจริง</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs bg-rose-950 text-rose-400 border border-rose-900/60 px-3 py-1.5 rounded-lg hover:bg-rose-900/20 transition font-bold"
        >
          รีเซ็ตข้อมูลจำลอง (Reset Simulator)
        </button>
      </div>

      <SimulationNotice />

      {/* Progress Card */}
      <SimulatorStepCard currentStep={currentStep} steps={steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Sandbox Control Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Intake */}
          {currentStep === 1 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ขั้นตอนที่ 1: ข้อความจากลูกค้า (Incoming Customer Message)</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-2">ทางลัดข้อความจำลอง (Presets)</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MESSAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 px-2.5 py-1.5 rounded transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block font-semibold">เลือกช่องทาง (Channel)</label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as ChannelType)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {Object.entries(CHANNEL_LABELS).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-slate-400 block font-semibold">ข้อความ (Message)</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="เช่น สนใจกางเกงช้างครับ A001"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDetectIntent}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition mt-2 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>ตรวจจับออเดอร์ (Detect Order)</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Variant & Stock Verification */}
          {currentStep === 2 && activeIntent && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ขั้นตอนที่ 2: ตรวจสอบคุณสมบัติและสต็อกสินค้า (Variant & Stock)</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  ย้อนกลับ
                </button>
              </div>

              {stockStatus?.error && (
                <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg text-xs text-rose-350 space-y-1">
                  <p className="font-bold">⚠️ ข้อมูลการวินิจฉัย</p>
                  <p>{stockStatus.error}</p>
                </div>
              )}

              {/* Missing variant options section */}
              {selectedProduct?.hasVariants && !selectedVariant && (
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-amber-400">❓ ข้อมูลที่ยังขาด (Missing Fields) - จำลองการถามสี/ไซด์ลูกค้า (Ask Customer for Variant):</p>
                  <div className="flex flex-wrap gap-2">
                    {variantOptions.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleChooseVariant(v)}
                        className={`text-xs px-3 py-2 rounded-lg border transition ${
                          false
                            ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {v.name} (คลังพร้อมขาย: {v.availableStock})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock suggestion alternative */}
              {selectedProduct && stockStatus && !stockStatus.available && (
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-rose-400">❌ สินค้าหมด (Out of Stock) - แนะนำสินค้าทดแทน:</p>
                  <div className="text-xs text-slate-400">
                    แนะนำสินค้าทดแทน: <span className="font-bold text-slate-200">Handwoven Boho Tote Bag (C003)</span> - คลังพร้อมขาย: 40 ชิ้น
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={handleCreateDraft}
                disabled={!selectedProduct || !stockStatus?.available || (selectedProduct.hasVariants && !selectedVariant)}
                className={`w-full font-bold py-2.5 rounded-lg text-xs transition ${
                  selectedProduct && stockStatus?.available && !(selectedProduct.hasVariants && !selectedVariant)
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    : "bg-slate-850 text-slate-600 cursor-not-allowed border border-slate-800"
                }`}
              >
                ยืนยันออเดอร์และจองสินค้า (Confirm Order & Reserve Stock)
              </button>

              {selectedProduct?.hasVariants && !selectedVariant && (
                <p className="text-xs text-amber-400 font-semibold text-center mt-2">
                  ⚠️ กรุณาจำลองการตอบสี/ไซด์ของลูกค้าก่อนยืนยันการจองสินค้า
                </p>
              )}
            </div>
          )}

          {/* Step 3: Reservation and payment */}
          {currentStep === 3 && activeOrder && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ขั้นตอนที่ 3: ตรวจสอบการชำระเงิน (Mock Payment Verification)</h3>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-200">จองสินค้าสำเร็จ: จองสินค้า / รอจ่าย (Reserved, Waiting Payment)</p>
                <p className="text-slate-400">
                  ยอดเงินที่ต้องชำระ: <span className="font-bold text-emerald-400">{activeOrder.totalAmount} บาท</span>
                </p>
                <p className="text-slate-500 text-[10px]">
                  ระบบล็อคสต็อกสินค้าไว้เรียบร้อยแล้ว กรุณาเลือกสถานะจำลองการสแกนสลิปชำระเงิน:
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 block font-semibold">เลือกรูปแบบการโอนเงิน (สลิปจำลอง)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: "valid", label: "สลิปถูกต้อง (Valid)" },
                    { value: "invalid", label: "สลิปไม่ถูกต้อง (Invalid)" },
                    { value: "duplicate", label: "สลิปซ้ำ (Duplicate)" },
                    { value: "mismatch", label: "ยอดเงินไม่ตรง (Mismatch)" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSlipQuality(opt.value as any)}
                      className={`p-2 text-xs border rounded-lg transition text-center ${
                        slipQuality === opt.value
                          ? "bg-emerald-950 border-emerald-500 text-emerald-400 font-bold"
                          : "bg-slate-900 border-slate-850 text-slate-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyPayment}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition"
              >
                ตรวจชำระเงินแบบจำลอง (Mock Payment Verification)
              </button>
            </div>
          )}

          {/* Step 4: Address and Logistics Dispatch */}
          {currentStep === 4 && activeOrder && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ขั้นตอนที่ 4: บันทึกข้อมูลที่อยู่ผู้รับและจัดคิวส่งสินค้า</h3>

              {activeOrder.status === "issue" ? (
                <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl space-y-2 text-xs text-rose-300">
                  <p className="font-bold">⚠️ ออเดอร์ถูกระงับเนื่องจากตรวจสลิปไม่ผ่าน / มีปัญหา (Issue)</p>
                  <p className="leading-relaxed">
                    ระบบจำลองพบปัญหาในการโอนเงินหรือยอดไม่ตรง ระบบจะระงับการบันทึกที่อยู่จนกว่าแอดมินจะกดยืนยันยอดรับเงินจริงด้วยตัวเอง
                  </p>
                  <button
                    onClick={() => {
                      // Bypass override mock status to let demo continue
                      const overridden = { ...activeOrder, status: "paid_waiting_address" as const, paidAmount: activeOrder.totalAmount, outstandingAmount: 0 };
                      setActiveOrder(overridden);
                      addSimulatedOrder(overridden);

                      const overrideEvent = createOrderEvent(
                        activeOrder.id,
                        "manual_override" as const,
                        "แอดมินตรวจสอบยอดโอนแล้วกดยืนยันรับยอดเงินเข้าระบบด้วยตัวเอง บังคับสถานะเป็น รอที่อยู่ (Paid, Waiting Address) [เฉพาะโหมดเดโม]"
                      );
                      setActiveEvents((prev) => [overrideEvent, ...prev]);
                      addSimulatedEvent(overrideEvent);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded border border-slate-700 transition"
                  >
                    กดยืนยันรับยอดเงินโอนด้วยแอดมินเอง (Override)
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Address Collection */}
                  <div className="space-y-3">
                    <label className="text-xs text-slate-400 block font-semibold">จำลองการกรอกที่อยู่ของลูกค้า (Collect Address)</label>
                    <textarea
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      disabled={activeOrder.status === "ready_to_ship" || activeOrder.status === "shipped"}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20 focus:outline-none focus:border-emerald-500"
                    />
                    
                    {activeOrder.status !== "ready_to_ship" && activeOrder.status !== "shipped" && (
                      <button
                        onClick={handleSubmitAddress}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition"
                      >
                        บันทึกที่อยู่ลูกค้า (Collect Address)
                      </button>
                    )}
                  </div>

                  {/* Tracking input */}
                  {(activeOrder.status === "ready_to_ship" || activeOrder.status === "shipped") && (
                    <div className="space-y-3 border-t border-slate-850 pt-4">
                      <label className="text-xs text-slate-400 block font-semibold">จำลองการออกเลขพัสดุ (Add Tracking)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          disabled={activeOrder.status === "shipped"}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        {activeOrder.status !== "shipped" && (
                          <button
                            onClick={handleAddTracking}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                          >
                            ย้ายเข้าคิวพร้อมส่ง & เพิ่มเลขพัสดุ (Move to Ready to Ship & Add Tracking)
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeOrder.status === "shipped" && (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-xs text-emerald-300 text-center font-bold">
                      🎉 จำลองขั้นตอนสำเร็จ! ออเดอร์นี้ถูกจัดทำคิว ส่งออกพัสดุ และบันทึกประวัติเข้าระบบเรียบร้อย
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Extraction Cards & Timelines */}
        <div className="space-y-6">
          {activeIntent && (
            <ParsedIntentCard
              intent={activeIntent}
              appliedColor={selectedVariant ? selectedVariant.name.split(" / ")[0] : undefined}
              appliedSize={selectedVariant ? selectedVariant.name.split(" / ")[1] : undefined}
            />
          )}
          
          <OrderLifecycleTimeline events={activeEvents} />
        </div>
      </div>
    </div>
  );
}

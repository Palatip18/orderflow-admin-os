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
  addSimulatedStockMovement
} from "@/lib/localOrderState";
import { ChannelType, ParsedOrderIntent, Order, OrderItem, ProductVariant, OrderEvent, Product } from "@/types/orderflow";
import { CHANNEL_LABELS } from "@/lib/statusLabels";
import SimulationNotice from "@/components/SimulationNotice";
import SimulatorStepCard from "@/components/SimulatorStepCard";
import ParsedIntentCard from "@/components/ParsedIntentCard";
import OrderLifecycleTimeline from "@/components/OrderLifecycleTimeline";

const PRESET_MESSAGES: { channel: ChannelType; text: string; label: string }[] = [
  { channel: "line", text: "สนใจกางเกงช้างครับ A001", label: "LINE: Inquiry for A001 (Missing Variant)" },
  { channel: "facebook_live", text: "A001 ดำ 1 ตัวครับ", label: "FB Live: Order A001 Black (Full Match)" },
  { channel: "instagram_dm", text: "สั่งเดรสผ้าไหม B002 สีทอง ไซส์ M 1 ชุดค่ะ", label: "IG DM: Order B002 Gold M (Full Match)" },
  { channel: "tiktok_live", text: "เอาเสื้อ B002 2 ชิ้นครับ", label: "TikTok: Order B002 (Missing Variant)" },
  { channel: "web_order", text: "สั่งกระเป๋า C003 1 ชิ้นค่ะ", label: "Web Link: Order C003 (Single Variant Match)" }
];

export default function SimulatorPage() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("line");
  const [inputText, setInputText] = useState("สนใจกางเกงช้างครับ A001");
  const [currentStep, setCurrentStep] = useState(1);

  // Simulation State
  const [activeIntent, setActiveIntent] = useState<ParsedOrderIntent | null>(null);
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
    { id: 1, label: "Message Intake" },
    { id: 2, label: "Variant & Stock" },
    { id: 3, label: "Reserve & Payment" },
    { id: 4, label: "Address & Dispatch" }
  ];

  // Load active simulation states if any existed in memory
  const handleSelectPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setSelectedChannel(preset.channel);
    setInputText(preset.text);
  };

  const handleReset = () => {
    resetSimulationState();
    setActiveIntent(null);
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

    // Create event log
    const event = createOrderEvent(intent.id, "order_detected", `Customer message detected via simulated ${CHANNEL_LABELS[selectedChannel].label}: "${inputText}"`);
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
      setStockStatus({ available: false, error: `Product code '${code || "unknown"}' not found in catalog.` });
      const errorEvent = createOrderEvent(intent.id, "human_review_required", `Product check failed: product code '${code || "unknown"}' not found. Shifting to human review queue.`);
      setActiveEvents((prev) => [errorEvent, ...prev]);
      setCurrentStep(2);
    }
  };

  // Step 2: Variant Specification
  const handleChooseVariant = (variant: ProductVariant) => {
    if (!activeIntent || !selectedProduct) return;
    setSelectedVariant(variant);
    setStockStatus({ available: variant.availableStock > 0 });

    const variantEvent = createOrderEvent(activeIntent.id, "variant_required", `Variant specified: customer selected variant '${variant.name}'`);
    setActiveEvents((prev) => [variantEvent, ...prev]);
  };

  const handleCreateDraft = () => {
    if (!activeIntent || !selectedProduct) return;
    
    // Create draft
    const { order, item } = createDraftOrder(activeIntent, selectedProduct, selectedVariant || undefined);
    order.channelType = selectedChannel;
    
    // If order has variants but none specified, keep waiting_variant, otherwise confirmed
    setActiveOrder(order);
    setActiveItem(item);

    const draftEvent = createOrderEvent(order.id, "status_change", `Draft order created successfully. Current Status: ${order.status}`);
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

    const reserveEvent = createOrderEvent(order.id, "stock_reserved", `Stock reserved for ${item.quantity} item(s). Hold expires at: ${new Date(reservedOrder.expiresAt || "").toLocaleTimeString()}`);
    setActiveEvents((prev) => [reserveEvent, ...prev]);
    addSimulatedEvent(reserveEvent);

    // In-app alert
    addSimulatedNotification({
      id: `not_${Date.now()}`,
      merchantId: "mch_001",
      alertLevel: "info",
      message: `Stock reserved successfully for order #${order.id} via simulated ${CHANNEL_LABELS[selectedChannel].label}`,
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
      `Payment slip scan completed. Code reference ref detected: ${payment.transactionRef}. Result: ${payment.paymentStatus}`
    );
    setActiveEvents((prev) => [verifyEvent, ...prev]);
    addSimulatedEvent(verifyEvent);

    if (order.status === "issue") {
      const issueEvent = createOrderEvent(order.id, "human_review_required", `Verification issues detected. Reason: ${payment.paymentStatus}. Admin intervention needed.`);
      setActiveEvents((prev) => [issueEvent, ...prev]);
      addSimulatedEvent(issueEvent);

      addSimulatedNotification({
        id: `not_${Date.now()}`,
        merchantId: "mch_001",
        alertLevel: "critical",
        message: `Order #${order.id} verification issue detected: ${payment.paymentStatus}`,
        orderId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else {
      addSimulatedNotification({
        id: `not_${Date.now()}`,
        merchantId: "mch_001",
        alertLevel: "info",
        message: `Order #${order.id} payment verified. Waiting for shipping address details.`,
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

    const addressEvent = createOrderEvent(updatedOrder.id, "address_received", `Shipping address captured: "${addressInput}"`);
    setActiveEvents((prev) => [addressEvent, ...prev]);
    addSimulatedEvent(addressEvent);

    if (updatedOrder.status === "ready_to_ship") {
      const readyEvent = createOrderEvent(updatedOrder.id, "ready_to_ship", "Order successfully advanced to ready-to-ship queues.");
      setActiveEvents((prev) => [readyEvent, ...prev]);
      addSimulatedEvent(readyEvent);
    }

    addSimulatedOrder(updatedOrder);
  };

  const handleAddTracking = () => {
    if (!activeOrder) return;

    const { order, shipping } = addTracking(activeOrder, trackingInput);
    setActiveOrder(order);

    const trackingEvent = createOrderEvent(order.id, "tracking_added", `Logistics tracking code uploaded: ${trackingInput} (${shipping.carrier})`);
    setActiveEvents((prev) => [trackingEvent, ...prev]);
    addSimulatedEvent(trackingEvent);

    const completeEvent = createOrderEvent(order.id, "status_change", "Order successfully dispatched to courier.");
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
      message: `Order #${order.id} shipped successfully. Tracking: ${trackingInput}`,
      orderId: order.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Order Lifecycle Simulator</h1>
          <p className="text-sm text-slate-400">Step-by-step interactive workflow simulator sandbox</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs bg-rose-950 text-rose-400 border border-rose-900/60 px-3 py-1.5 rounded-lg hover:bg-rose-900/20 transition font-bold"
        >
          Reset Simulation State / เคลียร์ดีโม
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Step 1: Ingest Customer Message</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-2">Preset Presets Shortcuts</p>
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
                    <label className="text-xs text-slate-400 block font-semibold">Feed Channel</label>
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
                    <label className="text-xs text-slate-400 block font-semibold">Message Text</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. สนใจกางเกงช้างครับ A001"
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
                  <span>Detect Intent & Check Stock / วิเคราะห์ข้อความ</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Variant & Stock Verification */}
          {currentStep === 2 && activeIntent && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Step 2: Variant Verification & Stock hold</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Back to Intake
                </button>
              </div>

              {stockStatus?.error && (
                <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg text-xs text-rose-350 space-y-1">
                  <p className="font-bold">⚠️ Diagnostic Warning</p>
                  <p>{stockStatus.error}</p>
                </div>
              )}

              {/* Missing variant options section */}
              {selectedProduct?.hasVariants && !selectedVariant && (
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-amber-400">❓ Missing Variant info detected. Ask customer reply simulation:</p>
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
                        {v.name} (Stock: {v.availableStock})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock suggestion alternative */}
              {selectedProduct && stockStatus && !stockStatus.available && (
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-rose-400">❌ Out of Stock. Suggest Alternatives:</p>
                  <div className="text-xs text-slate-400">
                    Alternative Product suggestion: <span className="font-bold text-slate-200">Handwoven Boho Tote Bag (C003)</span> - Available stock: 40 pcs.
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
                Confirm Order & Reserve Stock / ล็อคสต๊อกจองสินค้า
              </button>

              {selectedProduct?.hasVariants && !selectedVariant && (
                <p className="text-xs text-amber-400 font-semibold text-center mt-2">
                  ⚠️ Please simulate customer variant reply before confirming reservation.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Reservation and payment */}
          {currentStep === 3 && activeOrder && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Step 3: Payment Verification Slip</h3>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-slate-200">Hold Active: reserved_waiting_payment</p>
                <p className="text-slate-400">
                  Total price: <span className="font-bold text-emerald-400">{activeOrder.totalAmount} THB</span>.
                </p>
                <p className="text-slate-500 text-[10px]">
                  The stock reservation hold is set. Choose simulated payment status reference code verification:
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 block font-semibold">Simulate Slip Quality</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: "valid", label: "Valid Slip" },
                    { value: "invalid", label: "Invalid/Fake Slip" },
                    { value: "duplicate", label: "Duplicate Ref" },
                    { value: "mismatch", label: "Lower Amount" }
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
                Scan Slip & Verify Payment / ตรวจสอบสลิป (จำลอง)
              </button>
            </div>
          )}

          {/* Step 4: Address and Logistics Dispatch */}
          {currentStep === 4 && activeOrder && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Step 4: Shipping Capture & Logistics Queue</h3>

              {activeOrder.status === "issue" ? (
                <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl space-y-2 text-xs text-rose-300">
                  <p className="font-bold">⚠️ Order Paused in Issue cases queue</p>
                  <p className="leading-relaxed">
                    The payment scan flagged exceptions. Outstanding balance remains. The system will hold coordinates capture until resolved.
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
                        "Manual payment verification override executed by administrator. Status forced to paid_waiting_address. (Demo Mode only)"
                      );
                      setActiveEvents((prev) => [overrideEvent, ...prev]);
                      addSimulatedEvent(overrideEvent);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded border border-slate-700 transition"
                  >
                    Force Manual Payment Override
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Address Collection */}
                  <div className="space-y-3">
                    <label className="text-xs text-slate-400 block font-semibold">Simulate Customer Address Input</label>
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
                        Submit Address / บันทึกที่อยู่
                      </button>
                    )}
                  </div>

                  {/* Tracking input */}
                  {(activeOrder.status === "ready_to_ship" || activeOrder.status === "shipped") && (
                    <div className="space-y-3 border-t border-slate-850 pt-4">
                      <label className="text-xs text-slate-400 block font-semibold">Simulate Admin Dispatches Tracking Code</label>
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
                            Dispatch Order / ส่งพัสดุ
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeOrder.status === "shipped" && (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-xs text-emerald-300 text-center font-bold">
                      🎉 Simulation Loop Completed! Order has been packaged, tracked, and dispatched.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Extraction Cards & Timelines */}
        <div className="space-y-6">
          {activeIntent && <ParsedIntentCard intent={activeIntent} />}
          
          <OrderLifecycleTimeline events={activeEvents} />
        </div>
      </div>
    </div>
  );
}

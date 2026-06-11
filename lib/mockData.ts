import {
  Merchant,
  MerchantSettings,
  SalesChannel,
  Customer,
  Product,
  ProductVariant,
  IncomingMessage,
  Order,
  OrderItem,
  Payment,
  StockMovement,
  OrderEvent,
  MerchantNotification,
  ShippingRecord
} from "@/types/orderflow";

// 1. Merchant & Settings
export const mockMerchant: Merchant = {
  id: "mch_001",
  name: "Chaba Fashion Bangkok",
  email: "contact@chabafashion.co.th",
  taxId: "0105560000000",
  createdAt: "2026-01-15T08:00:00Z",
};

export const mockSettings: MerchantSettings = {
  id: "cfg_001",
  merchantId: "mch_001",
  reservationHoldTimeMinutes: 60,
  paymentAccountDisplay: "Kasikorn Bank (KBank) A/C: 012-3-45678-9 (Chaba Fashion)",
  notificationMode: "all",
  liveSaleMode: false,
  lowStockThreshold: 10,
  enabledChannels: ["line", "facebook_messenger", "facebook_live", "instagram_dm", "tiktok_live", "web_order"],
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-06-11T04:00:00Z",
};

// 2. Sales Channels
export const mockChannels: SalesChannel[] = [
  { id: "ch_line", name: "LINE Official Account (@chabafashion)", type: "line", isActive: true, createdAt: "2026-01-15T08:00:00Z" },
  { id: "ch_fb_msg", name: "Facebook Messenger Inbox", type: "facebook_messenger", isActive: true, createdAt: "2026-01-15T08:00:00Z" },
  { id: "ch_fb_live", name: "Facebook Live Stream Channel", type: "facebook_live", isActive: true, createdAt: "2026-02-10T10:00:00Z" },
  { id: "ch_ig_dm", name: "Instagram Direct Messages", type: "instagram_dm", isActive: true, createdAt: "2026-03-01T12:00:00Z" },
  { id: "ch_tiktok", name: "TikTok Live Comment Catch", type: "tiktok_live", isActive: true, createdAt: "2026-04-15T15:00:00Z" },
  { id: "ch_web", name: "OrderFlow Web Portal Link", type: "web_order", isActive: true, createdAt: "2026-01-15T08:00:00Z" },
];

// 3. Customers
export const mockCustomers: Customer[] = [
  {
    id: "cust_001",
    name: "Somchai Jaidee",
    channelType: "line",
    externalCustomerId: "U1234567890abcdef1234567890abcdef",
    phone: "081-234-5678",
    shippingAddress: "99/9 Sukhumvit Road, Khlong Toei, Bangkok 10110",
    createdAt: "2026-02-01T09:30:00Z",
    updatedAt: "2026-06-10T11:20:00Z",
  },
  {
    id: "cust_002",
    name: "Nong Pim",
    channelType: "facebook_messenger",
    externalCustomerId: "fb_user_8829103984",
    phone: "089-876-5432",
    shippingAddress: "5/12 Vibhavadi Rangsit Road, Chatuchak, Bangkok 10900",
    createdAt: "2026-03-12T14:15:00Z",
    updatedAt: "2026-06-11T03:10:00Z",
  },
  {
    id: "cust_003",
    name: "Siriporn Srisuk",
    channelType: "facebook_live",
    externalCustomerId: "fb_live_user_992019",
    createdAt: "2026-06-11T10:00:00Z",
    updatedAt: "2026-06-11T10:00:00Z",
  },
  {
    id: "cust_004",
    name: "Ananda E.",
    channelType: "instagram_dm",
    externalCustomerId: "ig_ananda_99",
    phone: "082-111-2222",
    shippingAddress: "88 Charoen Krung Road, Bang Kho Laem, Bangkok 10120",
    createdAt: "2026-05-20T11:00:00Z",
    updatedAt: "2026-05-20T11:05:00Z",
  },
  {
    id: "cust_005",
    name: "Kitti K.",
    channelType: "tiktok_live",
    externalCustomerId: "tt_kitti_12",
    createdAt: "2026-06-11T10:45:00Z",
    updatedAt: "2026-06-11T10:45:00Z",
  },
];

// 4. Products & Variants
export const mockProducts: Product[] = [
  {
    id: "prod_001",
    name: "Classic Elephant Pants (กางเกงช้างรุ่นคลาสสิก)",
    sku: "ELE-001",
    price: 199,
    availableStock: 120,
    reservedStock: 15,
    soldStock: 45,
    description: "Premium cotton elephant print trousers, soft and breathable. A classic Thai bestseller.",
    imageUrl: "https://images.unsplash.com/photo-1590534247854-e97d5e3feef6?w=200",
    hasVariants: true,
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "prod_002",
    name: "Premium Thai Silk Dress (เดรสผ้าไหมไทยพรีเมียม)",
    sku: "SLK-DRESS",
    price: 1290,
    availableStock: 8, // Low Stock Example
    reservedStock: 2,
    soldStock: 12,
    description: "Elegant tailored Thai silk dress suitable for formal occasions.",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200",
    hasVariants: true,
    createdAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "prod_003",
    name: "Handwoven Boho Tote Bag (กระเป๋าสานโบโฮทำมือ)",
    sku: "BAG-BOHO",
    price: 350,
    availableStock: 40,
    reservedStock: 0,
    soldStock: 8,
    description: "Handcrafted water hyacinth woven tote bag with fringe details.",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200",
    hasVariants: false,
    createdAt: "2026-03-01T09:00:00Z",
  },
];

export const mockVariants: ProductVariant[] = [
  // Elephant Pants Variants
  { id: "var_ele_black", productId: "prod_001", name: "Black / Free Size", sku: "ELE-001-BLK", price: 199, availableStock: 60, reservedStock: 10, soldStock: 25, createdAt: "2026-01-20T10:00:00Z" },
  { id: "var_ele_navy", productId: "prod_001", name: "Navy / Free Size", sku: "ELE-001-NVY", price: 199, availableStock: 60, reservedStock: 5, soldStock: 20, createdAt: "2026-01-20T10:00:00Z" },

  // Thai Silk Dress Variants
  { id: "var_slk_pink_m", productId: "prod_002", name: "Rose Pink / M", sku: "SLK-DRS-PNK-M", price: 1290, availableStock: 3, reservedStock: 1, soldStock: 5, createdAt: "2026-02-15T11:00:00Z" },
  { id: "var_slk_pink_l", productId: "prod_002", name: "Rose Pink / L", sku: "SLK-DRS-PNK-L", price: 1290, availableStock: 2, reservedStock: 0, soldStock: 4, createdAt: "2026-02-15T11:00:00Z" },
  { id: "var_slk_gold_m", productId: "prod_002", name: "Thai Gold / M", sku: "SLK-DRS-GLD-M", price: 1290, availableStock: 2, reservedStock: 1, soldStock: 2, createdAt: "2026-02-15T11:00:00Z" },
  { id: "var_slk_gold_l", productId: "prod_002", name: "Thai Gold / L", sku: "SLK-DRS-GLD-L", price: 1290, availableStock: 1, reservedStock: 0, soldStock: 1, createdAt: "2026-02-15T11:00:00Z" },
];

// 5. Incoming Messages (Unified Inbox)
export const mockMessages: IncomingMessage[] = [
  {
    id: "msg_001",
    channelType: "line",
    externalMessageId: "line_msg_8819029",
    externalSenderId: "U1234567890abcdef1234567890abcdef",
    senderName: "Somchai Jaidee",
    rawContent: "สนใจกางเกงช้างครับ",
    status: "processed",
    timestamp: "2026-06-11T10:15:00Z",
    intent: {
      id: "int_001",
      messageId: "msg_001",
      detectedIntent: "product_inquiry",
      confidenceScore: 0.95,
      parsedPayload: { productCode: "ELE-001" },
    },
  },
  {
    id: "msg_002",
    channelType: "facebook_messenger",
    externalMessageId: "fb_msg_339102",
    externalSenderId: "fb_user_8829103984",
    senderName: "Nong Pim",
    rawContent: "สั่งเดรสผ้าไหม สีทอง ไซส์ M 1 ชุดค่ะ โอนแล้วนะคะ สลิปด้านล่างเลยค่ะ",
    mediaUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300", // Simulate Slip
    status: "processed",
    timestamp: "2026-06-11T10:30:00Z",
    intent: {
      id: "int_002",
      messageId: "msg_002",
      detectedIntent: "payment_slip",
      confidenceScore: 0.88,
      parsedPayload: { color: "Thai Gold", size: "M", quantity: 1, slipReference: "202606110034912" },
    },
  },
  {
    id: "msg_003",
    channelType: "facebook_live",
    externalMessageId: "fb_live_cmt_441",
    externalSenderId: "fb_live_user_992019",
    senderName: "Siriporn Srisuk",
    rawContent: "ELE-001-BLK 1",
    status: "processed",
    timestamp: "2026-06-11T11:01:00Z",
    intent: {
      id: "int_003",
      messageId: "msg_003",
      detectedIntent: "order",
      confidenceScore: 0.99,
      parsedPayload: { productCode: "ELE-001", color: "Black", quantity: 1 },
    },
  },
  {
    id: "msg_004",
    channelType: "instagram_dm",
    externalMessageId: "ig_msg_9019",
    externalSenderId: "ig_ananda_99",
    senderName: "Ananda E.",
    rawContent: "ส่งไปที่: 88 ถนนเจริญกรุง แขวงบางคอแหลม เขตบางคอแหลม กทม. 10120 เบอร์ 082-111-2222 ครับ",
    status: "processed",
    timestamp: "2026-06-11T11:15:00Z",
    intent: {
      id: "int_004",
      messageId: "msg_004",
      detectedIntent: "address",
      confidenceScore: 0.94,
      parsedPayload: { addressText: "88 ถนนเจริญกรุง แขวงบางคอแหลม เขตบางคอแหลม กทม. 10120 เบอร์ 082-111-2222" },
    },
  },
  {
    id: "msg_005",
    channelType: "tiktok_live",
    externalMessageId: "tt_live_cmt_7719",
    externalSenderId: "tt_kitti_12",
    senderName: "Kitti K.",
    rawContent: "รหัสกระเป๋า BAG-BOHO ยังมีของไหมครับ",
    status: "pending",
    timestamp: "2026-06-11T11:38:00Z",
    intent: {
      id: "int_005",
      messageId: "msg_005",
      detectedIntent: "product_inquiry",
      confidenceScore: 0.91,
      parsedPayload: { productCode: "BAG-BOHO" },
    },
  },
];

// 6. Orders
export const mockOrders: Order[] = [
  {
    id: "ord_001",
    merchantId: "mch_001",
    customerId: "cust_001",
    channelType: "line",
    status: "reserved_waiting_payment",
    totalAmount: 199,
    paidAmount: 0,
    outstandingAmount: 199,
    expiresAt: "2026-06-11T12:45:00Z", // 1 hr hold
    createdAt: "2026-06-11T10:15:00Z",
    updatedAt: "2026-06-11T10:16:00Z",
  },
  {
    id: "ord_002",
    merchantId: "mch_001",
    customerId: "cust_002",
    channelType: "facebook_messenger",
    status: "ready_to_ship",
    totalAmount: 1290,
    paidAmount: 1290,
    outstandingAmount: 0,
    shippingAddress: "5/12 Vibhavadi Rangsit Road, Chatuchak, Bangkok 10900",
    createdAt: "2026-06-11T10:30:00Z",
    updatedAt: "2026-06-11T10:35:00Z",
  },
  {
    id: "ord_003",
    merchantId: "mch_001",
    customerId: "cust_003",
    channelType: "facebook_live",
    status: "confirmed",
    totalAmount: 199,
    paidAmount: 0,
    outstandingAmount: 199,
    createdAt: "2026-06-11T11:01:00Z",
    updatedAt: "2026-06-11T11:02:00Z",
  },
  {
    id: "ord_004",
    merchantId: "mch_001",
    customerId: "cust_004",
    channelType: "instagram_dm",
    status: "shipped",
    totalAmount: 1489, // Silk dress + elephant pants
    paidAmount: 1489,
    outstandingAmount: 0,
    shippingAddress: "88 Charoen Krung Road, Bang Kho Laem, Bangkok 10120",
    trackingNumber: "TH1290382910A",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-10T14:30:00Z",
  },
  {
    id: "ord_005",
    merchantId: "mch_001",
    customerId: "cust_005",
    channelType: "tiktok_live",
    status: "issue",
    totalAmount: 199,
    paidAmount: 180, // Paid 180 instead of 199
    outstandingAmount: 19,
    createdAt: "2026-06-11T10:45:00Z",
    updatedAt: "2026-06-11T10:50:00Z",
  },
];

// 7. Order Items
export const mockOrderItems: OrderItem[] = [
  { id: "item_001", orderId: "ord_001", productId: "prod_001", variantId: "var_ele_black", quantity: 1, unitPrice: 199, totalAmount: 199 },
  { id: "item_002", orderId: "ord_002", productId: "prod_002", variantId: "var_slk_gold_m", quantity: 1, unitPrice: 1290, totalAmount: 1290 },
  { id: "item_003", orderId: "ord_003", productId: "prod_001", variantId: "var_ele_black", quantity: 1, unitPrice: 199, totalAmount: 199 },
  { id: "item_004", orderId: "ord_004", productId: "prod_002", variantId: "var_slk_pink_m", quantity: 1, unitPrice: 1290, totalAmount: 1290 },
  { id: "item_005", orderId: "ord_004", productId: "prod_001", variantId: "var_ele_navy", quantity: 1, unitPrice: 199, totalAmount: 199 },
  { id: "item_006", orderId: "ord_005", productId: "prod_001", variantId: "var_ele_navy", quantity: 1, unitPrice: 199, totalAmount: 199 },
];

// 8. Payments
export const mockPayments: Payment[] = [
  {
    id: "pay_001",
    orderId: "ord_002",
    paymentStatus: "paid",
    amount: 1290,
    transactionRef: "202606110034912",
    transactionTime: "2026-06-11T10:33:00Z",
    slipImageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300",
    slipPayload: { verifiedSuccess: true, senderName: "Nong Pim", receivingBank: "KBank", transferredAmount: 1290 },
    verifiedAt: "2026-06-11T10:35:00Z",
    createdAt: "2026-06-11T10:33:00Z",
  },
  {
    id: "pay_002",
    orderId: "ord_005",
    paymentStatus: "amount_mismatch",
    amount: 180,
    transactionRef: "202606110039201",
    transactionTime: "2026-06-11T10:48:00Z",
    slipImageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300",
    slipPayload: { verifiedSuccess: true, senderName: "Kitti K.", receivingBank: "KBank", transferredAmount: 180 },
    verifiedAt: "2026-06-11T10:50:00Z",
    createdAt: "2026-06-11T10:48:00Z",
  },
];

// 9. Stock Movements
export const mockStockMovements: StockMovement[] = [
  { id: "stk_m_001", productId: "prod_001", variantId: "var_ele_black", orderId: "ord_001", type: "reserve", quantity: 1, note: "Order reservation hold", createdAt: "2026-06-11T10:15:00Z" },
  { id: "stk_m_002", productId: "prod_002", variantId: "var_slk_gold_m", orderId: "ord_002", type: "sale", quantity: 1, note: "Order completed sale", createdAt: "2026-06-11T10:35:00Z" },
];

// 10. Order Events
export const mockOrderEvents: OrderEvent[] = [
  { id: "evt_001", orderId: "ord_001", type: "status_change", description: "Order created. Status: draft.", actor: "system", createdAt: "2026-06-11T10:15:00Z" },
  { id: "evt_002", orderId: "ord_001", type: "status_change", description: "Stock reserved. Status: reserved_waiting_payment.", actor: "system", createdAt: "2026-06-11T10:16:00Z" },
  { id: "evt_003", orderId: "ord_002", type: "payment_attempt", description: "Payment slip uploaded and automatically verified via simulated SlipOK adapter.", actor: "customer", createdAt: "2026-06-11T10:33:00Z" },
];

// 11. Notifications
export const mockNotifications: MerchantNotification[] = [
  {
    id: "not_001",
    merchantId: "mch_001",
    alertLevel: "critical",
    message: "Low stock warning: Product 'Premium Thai Silk Dress' has only 8 items left in stock.",
    isRead: false,
    createdAt: "2026-06-11T08:00:00Z",
  },
  {
    id: "not_002",
    merchantId: "mch_001",
    alertLevel: "warning",
    message: "Order #ord_005 payment mismatch: Customer transferred 180 THB instead of 199 THB.",
    orderId: "ord_005",
    isRead: false,
    createdAt: "2026-06-11T10:50:00Z",
  },
  {
    id: "not_003",
    merchantId: "mch_001",
    alertLevel: "info",
    message: "New order received from LINE OA from Somchai Jaidee.",
    orderId: "ord_001",
    isRead: true,
    createdAt: "2026-06-11T10:15:00Z",
  },
];

// 12. Shipping Records
export const mockShippingRecords: ShippingRecord[] = [
  {
    id: "ship_001",
    orderId: "ord_004",
    carrier: "Thailand Post (EMS)",
    trackingNumber: "TH1290382910A",
    shippedAt: "2026-06-10T14:30:00Z",
    status: "in_transit",
    createdAt: "2026-06-10T14:30:00Z",
  },
];

import { IncomingMessage, Order, OrderEvent, MerchantNotification, OrderItem } from "@/types/orderflow";

export interface PendingLineOrderContext {
  lineUserId: string;
  productCode: string;
  productId?: string;
  productName: string;
  quantity: number;
  sourceIncomingMessageId: string;
  createdAt: string;
  status: "waiting_variant";
}

export interface ActiveLinePaymentOrderContext {
  lineUserId: string;
  orderId: string;
  productName: string;
  productCode: string;
  color: string;
  size: string;
  quantity: number;
  total: number;
  paymentStatus: "unpaid";
  createdAt: string;
}

interface ServerStore {
  incomingMessages: IncomingMessage[];
  orders: Order[];
  events: OrderEvent[];
  notifications: MerchantNotification[];
  items: OrderItem[];
  pendingLineOrders: Record<string, PendingLineOrderContext>;
  activeLinePaymentOrders: Record<string, ActiveLinePaymentOrderContext>;
}

// Ensure singleton across Hot Module Replacement in Next.js dev server
const globalForStore = globalThis as unknown as {
  __orderflow_server_store?: ServerStore;
};

if (!globalForStore.__orderflow_server_store) {
  globalForStore.__orderflow_server_store = {
    incomingMessages: [],
    orders: [],
    events: [],
    notifications: [],
    items: [],
    pendingLineOrders: {},
    activeLinePaymentOrders: {},
  };
}

const store = globalForStore.__orderflow_server_store;

export function getServerIncomingMessages(): IncomingMessage[] {
  return store.incomingMessages;
}

export function addServerIncomingMessage(msg: IncomingMessage): void {
  if (!store.incomingMessages.some((m) => m.id === msg.id)) {
    store.incomingMessages = [msg, ...store.incomingMessages];
  }
}

export function updateServerIncomingMessage(msg: IncomingMessage): void {
  store.incomingMessages = store.incomingMessages.map((m) => (m.id === msg.id ? msg : m));
}

export function getServerOrders(): Order[] {
  return store.orders;
}

export function addServerOrder(order: Order): void {
  if (!store.orders.some((o) => o.id === order.id)) {
    store.orders = [order, ...store.orders];
  }
}

export function updateServerOrder(order: Order): void {
  store.orders = store.orders.map((o) => (o.id === order.id ? order : o));
}

export function getServerEvents(): OrderEvent[] {
  return store.events;
}

export function addServerEvent(event: OrderEvent): void {
  if (!store.events.some((e) => e.id === event.id)) {
    store.events = [event, ...store.events];
  }
}

export function getServerNotifications(): MerchantNotification[] {
  return store.notifications;
}

export function addServerNotification(notif: MerchantNotification): void {
  if (!store.notifications.some((n) => n.id === notif.id)) {
    store.notifications = [notif, ...store.notifications];
  }
}

export function getServerOrderItems(): OrderItem[] {
  return store.items;
}

export function addServerOrderItem(item: OrderItem): void {
  if (!store.items.some((i) => i.id === item.id)) {
    store.items = [item, ...store.items];
  }
}

export function updateServerOrderItem(item: OrderItem): void {
  store.items = store.items.map((i) => (i.id === item.id ? item : i));
}

export function setPendingLineOrder(userId: string, context: PendingLineOrderContext): void {
  store.pendingLineOrders[userId] = context;
}

export function getPendingLineOrder(userId: string): PendingLineOrderContext | undefined {
  return store.pendingLineOrders[userId];
}

export function clearPendingLineOrder(userId: string): void {
  delete store.pendingLineOrders[userId];
}

export function setActiveLinePaymentOrder(userId: string, context: ActiveLinePaymentOrderContext): void {
  store.activeLinePaymentOrders[userId] = context;
}

export function getActiveLinePaymentOrder(userId: string): ActiveLinePaymentOrderContext | undefined {
  return store.activeLinePaymentOrders[userId];
}

export function clearActiveLinePaymentOrder(userId: string): void {
  delete store.activeLinePaymentOrders[userId];
}

export function resetServerStore(): void {
  store.incomingMessages = [];
  store.orders = [];
  store.events = [];
  store.notifications = [];
  store.items = [];
  store.pendingLineOrders = {};
  store.activeLinePaymentOrders = {};
}

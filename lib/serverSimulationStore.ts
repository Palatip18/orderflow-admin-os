import { IncomingMessage, Order, OrderEvent, MerchantNotification, OrderItem } from "@/types/orderflow";

interface ServerStore {
  incomingMessages: IncomingMessage[];
  orders: Order[];
  events: OrderEvent[];
  notifications: MerchantNotification[];
  items: OrderItem[];
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

export function resetServerStore(): void {
  store.incomingMessages = [];
  store.orders = [];
  store.events = [];
  store.notifications = [];
  store.items = [];
}

import { Order, OrderEvent, MerchantNotification, OrderItem, StockMovement } from "@/types/orderflow";
import { STORAGE_KEYS } from "./storageKeys";

const isBrowser = typeof window !== "undefined";

export function getSimulatedOrders(): Order[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOCK_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load simulated orders:", e);
    return [];
  }
}

export function saveSimulatedOrders(orders: Order[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.MOCK_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save simulated orders:", e);
  }
}

export function addSimulatedOrder(order: Order): void {
  const current = getSimulatedOrders();
  // Prevent duplicate additions
  if (!current.some((o) => o.id === order.id)) {
    saveSimulatedOrders([order, ...current]);
  }
}

export function updateSimulatedOrder(order: Order): void {
  const current = getSimulatedOrders();
  const updated = current.map((o) => (o.id === order.id ? order : o));
  saveSimulatedOrders(updated);
}

// --- Order Items Persistence ---
export function getSimulatedOrderItems(): OrderItem[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem("orderflow_simulated_items");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load simulated items:", e);
    return [];
  }
}

export function saveSimulatedOrderItems(items: OrderItem[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem("orderflow_simulated_items", JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save simulated items:", e);
  }
}

export function addSimulatedOrderItem(item: OrderItem): void {
  const current = getSimulatedOrderItems();
  if (!current.some((i) => i.id === item.id)) {
    saveSimulatedOrderItems([item, ...current]);
  }
}

// --- Stock Movements Persistence ---
export function getSimulatedStockMovements(): StockMovement[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem("orderflow_simulated_stock");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load simulated stock:", e);
    return [];
  }
}

export function saveSimulatedStockMovements(movements: StockMovement[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem("orderflow_simulated_stock", JSON.stringify(movements));
  } catch (e) {
    console.error("Failed to save simulated stock:", e);
  }
}

export function addSimulatedStockMovement(movement: StockMovement): void {
  const current = getSimulatedStockMovements();
  saveSimulatedStockMovements([movement, ...current]);
}

// --- Events ---
export function getSimulatedEvents(): OrderEvent[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem("orderflow_simulated_events");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load simulated events:", e);
    return [];
  }
}

export function saveSimulatedEvents(events: OrderEvent[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem("orderflow_simulated_events", JSON.stringify(events));
  } catch (e) {
    console.error("Failed to save simulated events:", e);
  }
}

export function addSimulatedEvent(event: OrderEvent): void {
  const current = getSimulatedEvents();
  saveSimulatedEvents([event, ...current]);
}

// --- Notifications ---
export function getSimulatedNotifications(): MerchantNotification[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOCK_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load simulated notifications:", e);
    return [];
  }
}

export function saveSimulatedNotifications(notifs: MerchantNotification[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.MOCK_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error("Failed to save simulated notifications:", e);
  }
}

export function addSimulatedNotification(notif: MerchantNotification): void {
  const current = getSimulatedNotifications();
  saveSimulatedNotifications([notif, ...current]);
}

// --- Reset ---
export function resetSimulationState(): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.MOCK_ORDERS);
    localStorage.removeItem("orderflow_simulated_items");
    localStorage.removeItem("orderflow_simulated_stock");
    localStorage.removeItem("orderflow_simulated_events");
    localStorage.removeItem(STORAGE_KEYS.MOCK_NOTIFICATIONS);
  } catch (e) {
    console.error("Failed to reset simulation state:", e);
  }
}

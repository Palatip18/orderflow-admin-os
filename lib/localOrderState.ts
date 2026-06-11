import { Order, OrderEvent, MerchantNotification } from "@/types/orderflow";
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

export function resetSimulationState(): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.MOCK_ORDERS);
    localStorage.removeItem("orderflow_simulated_events");
    localStorage.removeItem(STORAGE_KEYS.MOCK_NOTIFICATIONS);
  } catch (e) {
    console.error("Failed to reset simulation state:", e);
  }
}

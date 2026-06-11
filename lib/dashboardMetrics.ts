import { Order } from "@/types/orderflow";

export interface DashboardMetrics {
  totalOrders: number;
  confirmedOrders: number;
  paidOrders: number;
  waitingPaymentOrders: number;
  waitingAddressOrders: number;
  readyToShipOrders: number;
  issueOrders: number;
  totalSalesAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export function calculateDashboardMetrics(orders: Order[]): DashboardMetrics {
  let totalOrders = 0;
  let confirmedOrders = 0;
  let paidOrders = 0;
  let waitingPaymentOrders = 0;
  let waitingAddressOrders = 0;
  let readyToShipOrders = 0;
  let issueOrders = 0;
  let totalSalesAmount = 0;
  let paidAmount = 0;
  let outstandingAmount = 0;

  orders.forEach((order) => {
    // Exclude cancelled/expired from total revenue and outstanding calculations
    const isCancelledOrExpired = order.status === "cancelled" || order.status === "expired";

    totalOrders++;

    if (order.status === "confirmed") confirmedOrders++;
    if (order.status === "paid_waiting_address" || order.status === "ready_to_ship" || order.status === "shipped" || order.status === "completed") {
      paidOrders++;
    }
    if (order.status === "reserved_waiting_payment") waitingPaymentOrders++;
    if (order.status === "paid_waiting_address") waitingAddressOrders++;
    if (order.status === "ready_to_ship") readyToShipOrders++;
    if (order.status === "issue") issueOrders++;

    if (!isCancelledOrExpired) {
      totalSalesAmount += order.totalAmount;
      paidAmount += order.paidAmount;
      outstandingAmount += order.outstandingAmount;
    }
  });

  return {
    totalOrders,
    confirmedOrders,
    paidOrders,
    waitingPaymentOrders,
    waitingAddressOrders,
    readyToShipOrders,
    issueOrders,
    totalSalesAmount,
    paidAmount,
    outstandingAmount,
  };
}

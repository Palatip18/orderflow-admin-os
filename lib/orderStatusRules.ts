import { Order, Payment, OrderStatus, PaymentStatus } from "@/types/orderflow";

/**
 * Checks transition state of an Order based on a new Payment verification event
 */
export function determineOrderStatusAfterPayment(
  order: Order,
  payment: Payment
): { orderStatus: OrderStatus; paymentStatus: PaymentStatus } {
  // If payment status is invalid, duplicate, or expired, mark order as issue
  if (
    payment.paymentStatus === "duplicate_slip" ||
    payment.paymentStatus === "invalid_slip"
  ) {
    return {
      orderStatus: "issue",
      paymentStatus: payment.paymentStatus,
    };
  }

  // Check amount
  const totalPaid = (order.paidAmount || 0) + payment.amount;
  const difference = order.totalAmount - totalPaid;

  if (difference <= 0) {
    // Paid in full or overpaid
    return {
      // If address is already present, advance straight to ready_to_ship. Otherwise, waiting address.
      orderStatus: order.shippingAddress ? "ready_to_ship" : "paid_waiting_address",
      paymentStatus: "paid",
    };
  } else if (totalPaid > 0) {
    // Partially paid
    return {
      orderStatus: "issue", // Mismatch is treated as an issue requiring admin intervention
      paymentStatus: "partial_paid",
    };
  } else {
    // Unpaid/expired
    return {
      orderStatus: "reserved_waiting_payment",
      paymentStatus: "unpaid",
    };
  }
}

/**
 * Advance order status when an address is supplied by customer/admin
 */
export function processAddressSubmission(order: Order, address: string): OrderStatus {
  if (!address.trim()) return order.status;

  // If order is already paid but was waiting for address, it can now progress to ready_to_ship
  if (order.status === "paid_waiting_address") {
    return "ready_to_ship";
  }

  // Otherwise, stay in current status but store address
  return order.status;
}

/**
 * Validates whether reservation has expired based on holding configurations
 */
export function isReservationExpired(order: Order, now: Date = new Date()): boolean {
  if (order.status !== "reserved_waiting_payment" || !order.expiresAt) {
    return false;
  }
  const expiryTime = new Date(order.expiresAt);
  return now > expiryTime;
}

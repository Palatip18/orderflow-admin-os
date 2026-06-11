import { NextResponse } from "next/server";
import {
  getServerIncomingMessages,
  getServerOrders,
  getServerEvents,
  getServerNotifications,
  getServerOrderItems,
  resetServerStore
} from "@/lib/serverSimulationStore";

export const runtime = "nodejs";

export async function GET() {
  const data = {
    incomingMessages: getServerIncomingMessages(),
    orders: getServerOrders(),
    events: getServerEvents(),
    notifications: getServerNotifications(),
    items: getServerOrderItems()
  };

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

export async function DELETE() {
  resetServerStore();
  return NextResponse.json({ status: "success", message: "Server state store cleared" });
}

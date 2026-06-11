import { NextRequest, NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/lineSignature";
import { replyLineMessage, buildLineTextMessage } from "@/lib/lineClient";
import { mapLineTextToReply } from "@/lib/lineMessageMapper";
import {
  addServerIncomingMessage,
  getServerOrders,
  getServerOrderItems,
  addServerOrder,
  updateServerOrder,
  addServerOrderItem,
  updateServerOrderItem,
  addServerEvent,
  addServerNotification
} from "@/lib/serverSimulationStore";
import { IncomingMessage } from "@/types/orderflow";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const isEnabled = process.env.LINE_WEBHOOK_ENABLED === "true";
  const signature = request.headers.get("x-line-signature") || "";
  const secret = process.env.LINE_CHANNEL_SECRET || "";

  // 1. Read Raw Body
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error("Error reading raw body:", err);
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // 2. Signature verification
  const isSignatureValid = verifyLineSignature(rawBody, signature, secret);

  if (!isSignatureValid && isEnabled) {
    console.warn("Invalid LINE webhook signature.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Disabled mode behavior
  if (!isEnabled) {
    return NextResponse.json({
      status: "disabled",
      message: "LINE webhook processing is disabled (LINE_WEBHOOK_ENABLED is not true)"
    });
  }

  // 4. Parse JSON and process events
  try {
    const payload = JSON.parse(rawBody);
    const events = payload.events || [];

    for (const event of events) {
      // Ignore non-text events safely
      if (event.type !== "message" || !event.message || event.message.type !== "text") {
        continue;
      }

      const senderId = event.source?.userId || "unknown_user";
      const replyToken = event.replyToken;
      const text = event.message.text;

      // Find any active simulated orders for this LINE sender
      const activeOrder = getServerOrders().find(
        (o) => o.customerId === senderId && !["shipped", "completed", "cancelled", "expired"].includes(o.status)
      );

      const orderItem = activeOrder
        ? getServerOrderItems().find((i) => i.orderId === activeOrder.id)
        : undefined;

      // Get appropriate reply and simulation actions
      const {
        replyText,
        intent,
        newOrder,
        newItem,
        newEvents,
        newNotification
      } = mapLineTextToReply(text, senderId, activeOrder, orderItem);

      // Create incoming message record
      const incomingMsg: IncomingMessage = {
        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        channelType: "line",
        externalMessageId: event.message.id || `ext_${Date.now()}`,
        externalSenderId: senderId,
        senderName: "ลูกค้า LINE Alpha",
        rawContent: text,
        intent,
        status: "processed",
        orderId: newOrder?.id || activeOrder?.id,
        timestamp: new Date(event.timestamp || Date.now()).toISOString()
      };

      // Persist in server simulation store
      addServerIncomingMessage(incomingMsg);

      if (newOrder) {
        if (activeOrder) {
          updateServerOrder(newOrder);
        } else {
          addServerOrder(newOrder);
        }
      }

      if (newItem) {
        if (orderItem) {
          updateServerOrderItem(newItem);
        } else {
          addServerOrderItem(newItem);
        }
      }

      if (newEvents) {
        for (const evt of newEvents) {
          addServerEvent(evt);
        }
      }

      if (newNotification) {
        addServerNotification(newNotification);
      }

      // 5. Reply back to LINE via Messaging API
      if (replyToken) {
        const replySuccess = await replyLineMessage(replyToken, [buildLineTextMessage(replyText)]);
        if (!replySuccess) {
          console.error(`Failed to send LINE reply to token: ${replyToken}`);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Exception in LINE webhook route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

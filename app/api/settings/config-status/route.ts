import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    lineWebhookEnabled: process.env.LINE_WEBHOOK_ENABLED === "true",
    channelSecretConfigured: typeof process.env.LINE_CHANNEL_SECRET === "string" && process.env.LINE_CHANNEL_SECRET.length > 0,
    channelAccessTokenConfigured: typeof process.env.LINE_CHANNEL_ACCESS_TOKEN === "string" && process.env.LINE_CHANNEL_ACCESS_TOKEN.length > 0
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    }
  });
}

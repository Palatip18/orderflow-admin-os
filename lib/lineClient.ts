const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

export interface LineMessage {
  type: string;
  text: string;
}

export function buildLineTextMessage(text: string): LineMessage {
  return {
    type: "text",
    text,
  };
}

export async function replyLineMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is not configured.");
    return false;
  }

  try {
    const response = await fetch(LINE_REPLY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: messages.slice(0, 5), // LINE reply endpoint allows maximum 5 message objects
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`LINE Reply API error: ${response.status} - ${errText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception caught in LINE replyLineMessage helper:", error);
    return false;
  }
}

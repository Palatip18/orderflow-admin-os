import crypto from "crypto";

export function verifyLineSignature(
  rawBody: string,
  signature: string,
  channelSecret: string
): boolean {
  if (!signature || !channelSecret) return false;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");
  return hash === signature;
}

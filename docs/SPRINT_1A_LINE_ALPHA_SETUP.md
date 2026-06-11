# Sprint 1A — LINE Reply-only Alpha Setup Guide

This guide walks through configuring and testing the LINE Webhook integration on your local machine or staging environment.

## 1. Configure LINE Developer Console
1. Visit the [LINE Developers Console](https://developers.line.biz/).
2. Create a **Provider** if you don't have one.
3. Under the provider, create a **Messaging API** channel. This creates a test LINE Official Account (OA).
4. Go to the **Basic settings** tab and locate the **Channel secret**. Copy this value.
5. Go to the **Messaging API** tab, scroll to the bottom, and click **Issue** next to **Channel access token (long-lived)**. Copy this token.

## 2. Configure Local Environment Variables
Create a file named `.env.local` in the root directory of this project (you can copy `.env.example` to start):
```env
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_WEBHOOK_ENABLED=true
```

## 3. Expose Localhost to the Internet
LINE requires an HTTPS webhook endpoint. Expose your local development server (default port `3000`) using `ngrok`, `localtunnel`, or VS Code Port Forwarding:
```bash
ngrok http 3000
```
Copy the secure HTTPS URL (e.g. `https://xxxx.ngrok-free.app`).

## 4. Set Webhook URL in LINE
1. In the **Messaging API** tab of your channel on LINE Developers Console, locate the **Webhook settings**.
2. Enter your secure URL followed by `/api/line/webhook` (e.g., `https://xxxx.ngrok-free.app/api/line/webhook`).
3. Click **Update**.
4. Enable the toggle for **Use webhook**.
5. Click **Verify** to test signature handshakes. If configured correctly, it will report "Success".

## 5. Test Chat Integration
Add the LINE Official Account using the QR code in the Messaging API tab and run the following test sequences:

### Test Sequence A — Pending Variant Follow-up
1. **Send Message 1**: `สนใจกางเกงช้างครับ A001`
   - **Expected Bot Reply**: `พบสินค้า Classic Elephant Pants (กางเกงช้างรุ่นคลาสสิก) รหัส A001 ค่ะ ตอนนี้ยังมีสินค้า กรุณาระบุสีและไซด์ที่ต้องการ เช่น 'ขาว S' เพื่อให้ระบบจำลองการยืนยันออเดอร์ต่อค่ะ`
   - *This creates a pending order context in memory on the server.*
2. **Send Message 2**: `ขาว S`
   - **Expected Bot Reply**: `รับออเดอร์จำลองเรียบร้อยค่ะ Classic Elephant Pants (กางเกงช้างรุ่นคลาสสิก) White S จำนวน 1 ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`
   - *This completes the pending order context and transitions the status to Reserved / Waiting payment.*

### Test Sequence B — Full Order Command
1. **Send Message**: `CF A001 ขาว S`
   - **Expected Bot Reply**: `รับออเดอร์จำลองเรียบร้อยค่ะ Classic Elephant Pants (กางเกงช้างรุ่นคลาสสิก) White S จำนวน 1 ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`
   - *This immediately parses a complete order intent and registers the reserved order.*

### Test Sequence C — Unavailable Variant Selection
1. **Send Message 1**: `สนใจกางเกงช้างครับ A001`
2. **Send Message 2**: `ส้ม L`
   - **Expected Bot Reply**: `พบสินค้า Classic Elephant Pants (กางเกงช้างรุ่นคลาสสิก) ค่ะ แต่สี/ไซด์ที่เลือกยังไม่มีใน catalog จำลอง กรุณาเลือกจากตัวเลือกที่มี: Black / Free Size, Navy / Free Size, White / S ค่ะ`
   - *Bot lists available variants instead of looping into a generic error.*

### Test Sequence D — Payment Instruction Delivery
1. **Send Message 1**: `สนใจกางเกงช้างครับ A001`
2. **Send Message 2**: `ขาว S`
   - **Expected Bot Reply**: Should accept order and append the bank transfer/PromptPay details (ยอดชำระ: ฿199, ธนาคารตัวอย่าง (Demo Bank), เลขบัญชี: 000-0-00000-0) immediately in the same message.

### Test Sequence E — Resend Payment Details
1. *Ensure you have an active waiting payment order from sequence D.*
2. **Send Message**: `ขอเลข` (or `เลขบัญชี`, `โอนยังไง`, `จ่ายยังไง`)
   - **Expected Bot Reply**: Bot resends the bank transfer details for the current active order (`Classic Elephant Pants`, ยอดชำระ: ฿199).
3. **Send Message (No Active Order)**: Clear simulation state, then send `ขอเลข`
   - **Expected Bot Reply**: `ตอนนี้ยังไม่มีออเดอร์ที่รอชำระเงินค่ะ กรุณาพิมพ์รหัสสินค้า เช่น A001 หรือ CF A001 ขาว S เพื่อเริ่มออเดอร์ก่อนค่ะ`



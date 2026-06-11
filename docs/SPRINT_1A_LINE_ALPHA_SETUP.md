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
Add the LINE Official Account using the QR code in the Messaging API tab and test the following inputs:

### Test Case 1: Initial Interest & Catalog Match
- **Input text**: `สนใจกางเกงช้างครับ A001`
- **Expected reply**: `พบสินค้า กางเกงช้างยอดฮิต รหัส A001 ค่ะ ตอนนี้ยังมีสินค้า กรุณาระบุสีและไซด์ที่ต้องการ เช่น 'ขาว S' เพื่อให้ระบบจำลองการยืนยันออเดอร์ต่อค่ะ`

### Test Case 2: Completing Variants
- **Input text**: `CF A001 ขาว S`
- **Expected reply**: `รับออเดอร์จำลองเรียบร้อยค่ะ กางเกงช้างยอดฮิต ขาว S จำนวน 1 ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`

### Test Case 3: Variant-only Response (State-aware Flow)
- *Ensure you have an active order waiting for variants by sending `A001`.*
- **Input text**: `ขาว S`
- **Expected reply**: `รับออเดอร์จำลองเรียบร้อยค่ะ กางเกงช้างยอดฮิต ขาว S จำนวน 1 ชิ้น ระบบจะจำลองการจองสินค้าและรอชำระเงินค่ะ`

### Test Case 4: Missing product code
- **Input text**: `สนใจเสื้อลายทาง`
- **Expected reply**: `ระบบได้รับข้อความแล้วค่ะ แต่ยังไม่สามารถแปลงเป็นออเดอร์ได้ชัดเจน กรุณาพิมพ์รหัสสินค้า เช่น A001 หรือ CF A001 ขาว S ค่ะ`

### Test Case 5: Product Code Not Found
- **Input text**: `CF Z999`
- **Expected reply**: `ขออภัยค่ะ ระบบยังไม่พบรหัสสินค้านี้ใน catalog จำลอง กรุณาตรวจสอบรหัสสินค้าอีกครั้ง หรือรอแอดมินตรวจสอบค่ะ`

# PrintHub - Client Handover Configuration Guide

This guide contains the exact files and lines the client needs to modify to configure their personal UPI QR Code, target WhatsApp phone number, and Twilio credentials.

---

## 1. How to Change the UPI QR Code
The client has two ways to replace the default QR code image:

### Option A (Recommended - No code modifications)
Simply replace the image file located at:
`printhub-web/public/qr_code.jpg`
with their own personal QR code image, making sure it is named exactly **`qr_code.jpg`**.

### Option B (Modify the image path)
If they want to use a different filename or path:
*   **File:** [`printhub-web/src/app/configure/page.tsx`](file:///d:/XeroShop/v1/XerShop/printhub-web/src/app/configure/page.tsx)
*   **Line:** `729`
*   **Change:** Modify the `src` attribute `<img src="/qr_code.jpg" ... />` to reference their custom image name.

---

## 2. How to Change the Target WhatsApp Number
To change the target phone number where document/order notifications are sent:
*   **File:** [`printhub-backend/src/main/java/com/printhub/service/NotificationService.java`](file:///d:/XeroShop/v1/XerShop/printhub-backend/src/main/java/com/printhub/service/NotificationService.java)
*   **Line:** `128` (also update logging strings at lines `117` and `135` if desired)
*   **Change:**
    ```java
    new com.twilio.type.PhoneNumber("whatsapp:+918777815510")
    ```
    Replace `+918777815510` with their target WhatsApp number (keep the `whatsapp:` prefix and country code).

---

## 3. How to Configure Twilio API Credentials (for WhatsApp sending)
To configure the Twilio credentials for sending WhatsApp notifications:
*   **File:** [`printhub-backend/src/main/resources/application.yml`](file:///d:/XeroShop/v1/XerShop/printhub-backend/src/main/resources/application.yml)
*   **Lines:** `80` to `83`
*   **Change:**
    ```yaml
    twilio:
      account-sid: ${TWILIO_ACCOUNT_SID:your_twilio_sid_here}
      auth-token: ${TWILIO_AUTH_TOKEN:your_twilio_token_here}
      phone-from: ${TWILIO_PHONE_FROM:whatsapp:+14155238886}  # Twilio Sandbox number
    ```
    *They can either paste the credentials directly there or inject them as environment variables (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM`).*

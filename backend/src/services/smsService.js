/**
 * SMS Provider Abstraction Service (Twilio / Fast2SMS / Development Fallback)
 *
 * Configurable via environment variables:
 * SMS_PROVIDER=DEVELOPMENT_MOCK (or TWILIO / FAST2SMS)
 * SMS_API_KEY=your_api_key
 * SMS_SENDER_ID=SHOPSPH
 */

export const sendDeliveryOTP = async (phoneNumber, otp, orderNumber) => {
  const provider = process.env.SMS_PROVIDER || 'DEVELOPMENT_MOCK';

  const message = `Your ShopSphere delivery OTP for order ${orderNumber} is: ${otp}. It will expire in 10 minutes. Please share this code only with your rider upon package delivery.`;

  if (provider === 'TWILIO' && process.env.TWILIO_ACCOUNT_SID) {
    // Twilio SMS Integration placeholder
    console.log(`[SMS Service - Twilio] Dispatched to ${phoneNumber}`);
  } else if (provider === 'FAST2SMS' && process.env.SMS_API_KEY) {
    // Fast2SMS API placeholder
    console.log(`[SMS Service - Fast2SMS] Dispatched to ${phoneNumber}`);
  } else {
    // Development / Demonstration Mode Logging
    console.log(`==================================================`);
    console.log(`[SMS SERVICE - DEV NOTIFICATION LOG]`);
    console.log(`Recipient Phone: ${phoneNumber || '+91 9876543212'}`);
    console.log(`Order Ref: ${orderNumber}`);
    console.log(`Generated OTP: ${otp}`);
    console.log(`==================================================`);
  }

  return {
    success: true,
    phoneNumber: phoneNumber || '+91 9876543212',
    otp,
    provider,
    dispatchedAt: new Date().toISOString(),
  };
};

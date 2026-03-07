import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

/**
 * Send a WhatsApp message using Twilio.
 * @param to - The recipient's phone number (with country code, e.g., "91XXXXXXXXXX")
 * @param message - The text content of the message
 */
export async function sendWhatsApp(to: string, message: string) {
  const cleanFrom = fromPhoneNumber.trim();
  // Clean the phone number: remove any non-digit characters except for a potentially leading plus
  const digitsOnly = to.replace(/\D/g, '');
  const formattedTo = `whatsapp:+${digitsOnly}`;

  // Ensure 'from' starts with whatsapp: prefix and has +
  const formattedFrom = cleanFrom.startsWith("whatsapp:")
    ? cleanFrom
    : `whatsapp:${cleanFrom.startsWith('+') ? '' : '+'}${cleanFrom}`;

  console.log(`[WhatsApp] Attempting send: From=${formattedFrom} To=${formattedTo}`);

  if (!accountSid || !authToken) {
    console.warn("[WhatsApp] Twilio credentials missing. Logging message below:");
    console.log(`Message: ${message}`);
    return { success: true, mocked: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: message,
    });
    console.log(`[WhatsApp] Message successfully sent: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("[WhatsApp] Twilio API Error:", error);
    throw error;
  }
}

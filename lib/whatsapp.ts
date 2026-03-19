import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

/**
 * Send a WhatsApp message using Twilio.
 * Supports both plain text and Twilio Templates (Content API).
 * @param to - The recipient's phone number (with country code, e.g., "91XXXXXXXXXX")
 * @param message - The text content of the message (used as body or fallback)
 * @param options - Optional template settings
 */
export async function sendWhatsApp(
  to: string, 
  message: string, 
  options?: { contentSid?: string; contentVariables?: Record<string, string> }
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhoneNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const defaultContentSid = process.env.TWILIO_CONTENT_SID;

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
    
    const messageDetails: any = {
      from: formattedFrom,
      to: formattedTo,
    };

    // Template logic
    if (options?.contentSid) {
      messageDetails.contentSid = options.contentSid;
      if (options.contentVariables) {
        messageDetails.contentVariables = JSON.stringify(options.contentVariables);
      }
    } else if (defaultContentSid) {
      // If a default template is configured, use it for all messages
      messageDetails.contentSid = defaultContentSid;
      
      const isStatic = process.env.TWILIO_TEMPLATE_IS_STATIC === "true";
      if (!isStatic) {
        // This assumes the template has a single variable {{1}} for the message body
        messageDetails.contentVariables = JSON.stringify({ "1": message });
      }
      // If isStatic is true, we send just the contentSid, matching Option B
    } else {
      // Legacy behavior: plain text body
      messageDetails.body = message;
    }

    const result = await client.messages.create(messageDetails);
    console.log(`[WhatsApp] Message sent. SID: ${result.sid} | Status: ${result.status} | Error: ${result.errorCode || 'none'} - ${result.errorMessage || 'none'}`);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error("[WhatsApp] Twilio API Error:", error);
    throw error;
  }
}
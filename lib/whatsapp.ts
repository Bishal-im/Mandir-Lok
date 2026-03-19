import twilio from "twilio";
import fs from "fs";
import path from "path";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const defaultContentSid = process.env.TWILIO_CONTENT_SID;

/**
 * Send a WhatsApp message using Twilio.
 * Supports both plain text and Twilio Templates (Content API).
 * @param to - The recipient's phone number (with country code, e.g., "91XXXXXXXXXX")
 * @param messageOrSid - The text content OR the Twilio Content SID (HX...)
 * @param optionsOrVariables - Optional template variables or settings { contentSid?, contentVariables? }
 */
export async function sendWhatsApp(
  to: string, 
  messageOrSid: string, 
  optionsOrVariables?: any
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  const cleanTo = to.replace(/[^0-9]/g, "");
  const formattedTo = `whatsapp:+${cleanTo}`;

  const cleanFrom = from.trim();
  const formattedFrom = cleanFrom.startsWith("whatsapp:")
    ? cleanFrom
    : `whatsapp:${cleanFrom.startsWith('+') ? '' : '+'}${cleanFrom}`;

  const logFile = path.join(process.cwd(), 'whatsapp_debug.log');
  
  // Trimming variables for safety
  const cleanVariables: Record<string, string> = {};
  let contentSid: string | undefined = undefined;

  // Handle both signatures:
  // 1. (to, sid, { contentSid, contentVariables })
  // 2. (to, sid, { "1": "val1", "2": "val2" })
  if (optionsOrVariables) {
    if (optionsOrVariables.contentVariables) {
      // Style 1 (Remote)
      contentSid = optionsOrVariables.contentSid;
      for (const [key, val] of Object.entries(optionsOrVariables.contentVariables)) {
        cleanVariables[key] = (val || "").toString().trim();
      }
    } else {
      // Style 2 (Local)
      for (const [key, val] of Object.entries(optionsOrVariables)) {
        cleanVariables[key] = (val || "").toString().trim();
      }
    }
  }

  // Detect if messageOrSid is actually a SID
  const isContentSid = (messageOrSid || "").startsWith("HX");
  if (isContentSid && !contentSid) {
    contentSid = messageOrSid;
  }

  // File logging (if needed)
  try {
     fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] Attempt: From=${formattedFrom} To=${formattedTo}\nSID/Body: ${messageOrSid}\nVars: ${JSON.stringify(cleanVariables)}\n`);
  } catch (e) {
     console.warn("[WhatsApp Log Error]", e);
  }

  if (!accountSid || !authToken) {
    console.warn("[WhatsApp] Credentials missing, mocking success.");
    return { success: true, mocked: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const payload: any = {
      from: formattedFrom,
      to: formattedTo,
    };

    if (contentSid) {
      payload.contentSid = contentSid;
      if (Object.keys(cleanVariables).length > 0) {
        payload.contentVariables = JSON.stringify(cleanVariables);
      }
    } else if (defaultContentSid) {
       // Support remote's default template logic
       payload.contentSid = defaultContentSid;
       const isStatic = process.env.TWILIO_TEMPLATE_IS_STATIC === "true";
       if (!isStatic) {
         payload.contentVariables = JSON.stringify({ "1": messageOrSid });
       }
    } else {
      payload.body = messageOrSid;
    }

    const result = await client.messages.create(payload);
    // Log success
    try {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] SUCCESS: ${result.sid} | Status: ${result.status}\n`);
    } catch (e) {}
    
    console.log(`[WhatsApp] Message sent. SID: ${result.sid} | Status: ${result.status}`);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error: any) {
    // Log error
    try {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR: ${error.message}\n`);
    } catch (e) {}
    
    console.error("[WhatsApp Error]", error);
    throw error;
  }
}
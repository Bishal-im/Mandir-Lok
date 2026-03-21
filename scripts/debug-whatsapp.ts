import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function runTests() {
  const to = 'whatsapp:+919008332752'; // Indian number
  const directFrom = 'whatsapp:+18146878594'; // THE NUMBER DIRECTLY
  const oldContentSid = 'HXda318f10e24726fb8a96935489749da7'; // admin_assigned_update (The one that was failing)
  
  const vars = {
    "1": "Mandir Name",
    "2": "Pandit Name",
    "3": "+918000000000",
    "4": "BK-TEST-101",
    "5": "22/03/2026"
  };

  console.log(`\n--- Starting WhatsApp Debug Test (FINAL LOCALE TEST) ---`);
  console.log(`From (Number): ${directFrom}`);
  console.log(`To: ${to}`);
  console.log(`Content SID: ${oldContentSid}`);

  // Variation: UNDERSCORE Locale (en_US)
  try {
    console.log(`\n[Test 1] Trying 'en_US' (with underscore)...`);
    const msg = await client.messages.create({
      to,
      from: directFrom,
      contentSid: oldContentSid,
      // @ts-ignore
      contentVariables: vars,
      // @ts-ignore
      language: 'en_US' // MOST LIKELY FIX
    });
    console.log(`Result: SUCCESS (SID: ${msg.sid}, Status: ${msg.status})`);
  } catch (err: any) {
    console.log(`Result: FAILED (Code: ${err.code}) | ${err.message}`);
  }

  // Variation: PLAIN 'en'
  try {
    console.log(`\n[Test 2] Trying 'en' (plain)...`);
    const msg = await client.messages.create({
      to,
      from: directFrom,
      contentSid: oldContentSid,
      // @ts-ignore
      contentVariables: vars,
      // @ts-ignore
      language: 'en'
    });
    console.log(`Result: SUCCESS (SID: ${msg.sid}, Status: ${msg.status})`);
  } catch (err: any) {
    console.log(`Result: FAILED (Code: ${err.code}) | ${err.message}`);
  }

  console.log(`\n--- Tests Finished ---`);
}

runTests();

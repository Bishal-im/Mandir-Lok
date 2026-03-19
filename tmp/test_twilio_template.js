const { sendWhatsApp } = require('../lib/whatsapp');
require('dotenv').config({ path: '.env.local' });

async function testTemplate() {
  const to = process.argv[2];
  if (!to) {
    console.log("Usage: node tmp/test_twilio_template.js <phone_number_with_country_code>");
    process.exit(1);
  }

  console.log(`Sending test template message to ${to}...`);
  try {
    const result = await sendWhatsApp(to, "Test message using Twilio Template from MandirLok");
    console.log("Result:", result);
    if (result.success) {
      console.log("✅ Message sent successfully!");
    }
  } catch (error) {
    console.error("❌ Failed to send message:", error);
  }
}

// Note: This script uses require, but lib/whatsapp.ts is likely using ES modules (import/export)
// since it's a Next.js project. We might need to run it through ts-node or use a temporary API route.
// Let's create a temporary API route instead for easier testing in the browser/Postman.

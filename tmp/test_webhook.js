import crypto from 'crypto';

const secret = 'test_secret';
const timestamp = Date.now().toString();
const body = JSON.stringify({
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
        order: { order_id: 'test_order_123' },
        payment: { cf_payment_id: 'cf_pay_456' }
    }
});

const data = timestamp + body;
const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64');

console.log('Timestamp:', timestamp);
console.log('Body:', body);
console.log('Signature:', signature);

// Example CURL command
console.log('\n--- Test CURL Command ---');
console.log(`curl -X POST http://localhost:3000/api/webhooks/cashfree \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-signature: ${signature}" \\
  -H "x-webhook-timestamp: ${timestamp}" \\
  -d '${body}'`);

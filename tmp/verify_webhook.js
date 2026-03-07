// Verification script using built-in fetch

async function testWebhook() {
    const url = 'http://localhost:3000/api/webhooks/cashfree';
    
    console.log('--- Testing without headers ---');
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ test: true }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }

    console.log('\n--- Testing without secret (but with headers) ---');
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ test: true }),
            headers: { 
                'Content-Type': 'application/json',
                'x-webhook-signature': 'dummy',
                'x-webhook-timestamp': Date.now().toString()
            }
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWebhook();

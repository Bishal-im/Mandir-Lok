/**
 * Utility for Cashfree Payment Gateway and Payouts
 * Using direct REST API calls for maximum compatibility.
 */

const CASHFREE_PG_BASE_URL = process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_PAYOUT_BASE_URL = process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://payout-api.cashfree.com/payout/v1"
    : "https://payout-gamma.cashfree.com/payout/v1-1";

/**
 * Creates a Cashfree Order (Pay-In)
 */
export async function createCashfreeOrder(params: {
    orderId: string;
    amount: number;
    customerId: string;
    customerPhone: string;
    customerName: string;
    orderNote?: string;
}) {
    const response = await fetch(`${CASHFREE_PG_BASE_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.CASHFREE_APP_ID!,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
            "x-api-version": "2023-08-01",
        },
        body: JSON.stringify({
            order_id: params.orderId,
            order_amount: params.amount,
            order_currency: "INR",
            customer_details: {
                customer_id: params.customerId,
                customer_phone: params.customerPhone,
                customer_name: params.customerName,
            },
            order_meta: {
                // Return URL after payment
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/verify?order_id={order_id}`,
            },
            order_note: params.orderNote,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Cashfree Order creation failed");
    }
    return data;
}

/**
 * Verifies a Cashfree Payment (Pay-In)
 */
export async function verifyCashfreePayment(orderId: string) {
    const response = await fetch(`${CASHFREE_PG_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.CASHFREE_APP_ID!,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
            "x-api-version": "2023-08-01",
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Cashfree verification failed");
    }
    return data;
}

/**
 * Creates a payout using Cashfree Payout API (Pay-Out)
 */
export async function createCashfreePayout(params: {
    amount: number;
    beneficiaryId: string;
    payoutMode: "UPI" | "BANK_TRANSFER";
    transferId: string;
}) {
    const response = await fetch(`${CASHFREE_PAYOUT_BASE_URL}/directTransfer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID!,
            "X-Client-Secret": process.env.CASHFREE_PAYOUT_CLIENT_SECRET!,
        },
        body: JSON.stringify({
            transferId: params.transferId,
            amount: params.amount,
            transferMode: params.payoutMode === "UPI" ? "upi" : "banktransfer",
            beneficiaryId: params.beneficiaryId,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Cashfree Payout failed");
    }
    return data;
}

/**
 * Creates a beneficiary for Payouts
 */
export async function createBeneficiary(params: {
    beneficiaryId: string;
    name: string;
    email: string;
    phone: string;
    bankDetails?: {
        accountNumber: string;
        ifsc: string;
    };
    vpa?: string;
}) {
    const body: any = {
        beneficiaryId: params.beneficiaryId,
        name: params.name,
        email: params.email,
        phone: params.phone,
    };

    if (params.vpa) {
        body.vpa = params.vpa;
    } else if (params.bankDetails) {
        body.bankAccount = params.bankDetails.accountNumber;
        body.ifsc = params.bankDetails.ifsc;
    }

    const response = await fetch(`${CASHFREE_PAYOUT_BASE_URL}/addBeneficiary`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": process.env.CASHFREE_PAYOUT_CLIENT_ID!,
            "X-Client-Secret": process.env.CASHFREE_PAYOUT_CLIENT_SECRET!,
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok && response.status !== 409) {
        throw new Error(data.message || "Failed to create beneficiary");
    }
    return data;
}

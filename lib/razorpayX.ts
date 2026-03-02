const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

export async function createContact(name: string, email: string, contact: string, referenceId: string) {
    const response = await fetch("https://api.razorpay.com/v1/contacts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
            name,
            email,
            contact,
            type: "vendor",
            reference_id: referenceId,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.description || "Failed to create contact");
    return data;
}

export async function createFundAccount(contactId: string, accountType: "vpa" | "bank_account", details: any) {
    const body: any = {
        contact_id: contactId,
        account_type: accountType,
    };

    if (accountType === "vpa") {
        body.vpa = { address: details.vpa };
    } else {
        body.bank_account = {
            name: details.name,
            ifsc: details.ifsc,
            account_number: details.accountNumber,
        };
    }

    const response = await fetch("https://api.razorpay.com/v1/fund_accounts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.description || "Failed to create fund account");
    return data;
}

export async function createRazorpayPayout(params: {
    accountNumber: string;
    fundAccountId: string;
    amount: number;
    currency: string;
    mode: "UPI" | "IMPS" | "NEFT" | "RTGS";
    purpose: "payout" | "refund" | "cashback";
    queueIfLowBalance: boolean;
    referenceId: string;
    narrative?: string;
}) {
    const response = await fetch("https://api.razorpay.com/v1/payouts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
            account_number: params.accountNumber,
            fund_account_id: params.fundAccountId,
            amount: params.amount * 100, // Razorpay uses paise
            currency: params.currency,
            mode: params.mode,
            purpose: params.purpose,
            queue_if_low_balance: params.queueIfLowBalance,
            reference_id: params.referenceId,
            narrative: params.narrative,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.description || "Failed to create payout");
    return data;
}

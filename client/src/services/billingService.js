// src/services/billingService.js
export async function generateInvoice(payload) {
    const res = await fetch("/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Billing failed");
    }

    return await res.blob();
}

export async function scanBarcode() {
    const res = await fetch("/run-scanner");
    const data = await res.json();
    return data.barcode || null;
}

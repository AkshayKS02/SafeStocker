import { apiFetch } from "./api.js";

export async function generateInvoice(payload) {
    const res = await apiFetch("/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res) throw new Error("Unauthorized");

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Billing failed");
    }

    return await res.blob();
}

export async function scanBarcode() {
    const res = await apiFetch("/run-scanner");
    if (!res) return null;

    const data = await res.json();
    return data.barcode || null;
}

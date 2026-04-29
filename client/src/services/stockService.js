import { apiFetch } from "./api.js";

function calcDays(dateStr) {
    if (!dateStr) return null;
    return Math.floor(
        (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
    );
}

function statusColor(days) {
    if (days === null) return "gray";
    if (days < 0) return "red";
    if (days <= 7) return "orange";
    if (days <= 14) return "yellow";
    return "green";
}

function normalizeStockRow(row) {
    const days = calcDays(row.ExpiryDate);

    return {
        stockID: row.StockID,
        itemID: row.ItemID,
        name: row.ItemName || "Unknown",
        barcode: row.Barcode || "",
        price: Number(row.Price) || 0,
        inStock: row.Quantity ?? 0,
        expiry: row.ExpiryDate || "",
        daysLeft: days,
        color: statusColor(days)
    };
}

export async function fetchStock(shopID) {
    if (!shopID) return [];

    try {
        const res = await apiFetch(`/stock/${shopID}`);
        if (!res) return [];

        const rows = await res.json();
        return rows.map(normalizeStockRow);

    } catch {
        return [];
    }
}

export async function fetchItemOptions() {
    try {
        const res = await apiFetch("/items");
        if (!res) return [];

        return await res.json();
    } catch {
        return [];
    }
}

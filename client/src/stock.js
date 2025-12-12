// src/stock.js

export let SHOP_ID = null;
export let STOCK_ITEMS = [];

// Set active shop
export function setShopID(id) {
    SHOP_ID = id;
}

// Days until expiry
function calcDays(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.floor((d - new Date()) / (1000 * 60 * 60 * 24));
}

// Expiry status
function statusColor(days) {
    if (days === null) return "unknown";
    if (days < 0) return "expired";
    if (days <= 7) return "near";
    return "fresh";
}

// Normalize backend stock row
function normalize(row) {
    const days = calcDays(row.ExpiryDate);

    return {
        stockID: row.StockID,
        itemID: row.ItemID,

        name: row.ItemName || "Unknown",
        barcode: row.Barcode || "",
        inStock: row.Quantity ?? 0,

        expiry: row.ExpiryDate || "",
        daysLeft: days,
        color: statusColor(days)
    };
}

// Fetch stock for the logged-in shop
export async function loadStock() {
    if (!SHOP_ID) {
        console.warn("loadStock() called without SHOP_ID");
        return [];
    }

    try {
        const res = await fetch(`http://localhost:5000/stock/${SHOP_ID}`);
        const rows = await res.json();
        STOCK_ITEMS = rows.map(normalize);
        return STOCK_ITEMS;

    } catch (err) {
        console.error("Error loading stock:", err);
        return [];
    }
}

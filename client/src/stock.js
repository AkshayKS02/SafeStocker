// src/stock.js
import { log } from "./utils/logger.js";

log("stock.js loaded", 'info');

export let SHOP_ID = null;
export let STOCK_ITEMS = [];

// Set active shop
export function setShopID(id) {
    SHOP_ID = id;
    log(`Shop ID set to: ${id}`, 'ui');
}

// Days until expiry
function calcDays(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.floor((d - new Date()) / (1000 * 60 * 60 * 24));
}

// Expiry status
function statusColor(days) {
    if (days === null) return "gray"; // Unknown
    if (days < 0) return "red"; // Expired
    if (days <= 7) return "yellow"; // Near
    return "green"; // Fresh
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
    log("loadStock() start", 'action');
    if (!SHOP_ID) {
        log("loadStock() called without SHOP_ID", 'error');
        return [];
    }

    try {
        const res = await fetch(`http://localhost:5000/stock/${SHOP_ID}`);
        log(`Fetched stock for Shop ID: ${SHOP_ID}`, 'ui');
        const rows = await res.json();
        STOCK_ITEMS = rows.map(normalize);
        log(`Stock loaded: ${STOCK_ITEMS.length} items`, 'success');
        return STOCK_ITEMS;

    } catch (err) {
        log(`Error loading stock: ${err.message}`, 'error');
        return [];
    } finally {
        log("loadStock() end", 'end');
    }
}

export async function loadItemOptions(selectEl) {
    if (!selectEl) return;

    try {
        const res = await fetch("http://localhost:5000/items", {
            credentials: "include"
        });

        const items = await res.json();

        selectEl.innerHTML = `<option value="">-- Select Product --</option>`;

        items.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item.ItemID;
            opt.textContent = item.ItemName;
            selectEl.appendChild(opt);
        });

        log("Add Stock dropdown populated", "success");

    } catch (err) {
        log(`Dropdown load failed: ${err.message}`, "error");
    }
}

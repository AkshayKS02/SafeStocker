// src/stock.js
import { fetchStock } from "./services/stockService.js";

export let shopID = null;
export let stockItems = [];

export function setShopID(id) {
    shopID = id;
}

export async function loadStock() {
    if (!shopID) return [];
    stockItems = await fetchStock(shopID);
    return stockItems;
}



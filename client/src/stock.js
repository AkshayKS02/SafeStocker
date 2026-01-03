// src/stock.js
import { fetchStock } from "./services/stockService.js";
import {
  shouldCheckAlerts,
  generateAlerts,
  markAlertCheckDone
} from "./alerts/alerts.service.js";
import { renderAlerts } from "./alerts/alerts.ui.js";

export let shopID = null;
export let stockItems = [];

export function setShopID(id) {
    shopID = id;
}

export async function loadStock() {
    if (!shopID) return [];
    stockItems = await fetchStock(shopID);

    if (shouldCheckAlerts()) {
        const alerts = generateAlerts(stockItems);
        renderAlerts(alerts);
        markAlertCheckDone();
    }

    return stockItems;
}



// src/stock.js
import { fetchStock } from "./services/stockService.js";
import {
  shouldCheckAlerts,
  generateAlerts,
  markAlertCheckDone
} from "./alerts/alerts.service.js";
import { renderAlerts } from "./alerts/alerts.ui.js";

export let stockItems = [];

export async function loadStock() {
    stockItems = await fetchStock();

    if (shouldCheckAlerts()) {
        const alerts = generateAlerts(stockItems);
        renderAlerts(alerts);
        markAlertCheckDone();
    }

    return stockItems;
}

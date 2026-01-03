// src/views/stock.view.js
import { DOM } from "../core/dom.js";

export function resetStockForm() {
    if (DOM.stock.form) {
        DOM.stock.form.reset();
    }
}

export function setItemOptions(items) {
    if (!DOM.stock.itemSelect) return;

    DOM.stock.itemSelect.innerHTML =
        `<option value="">-- Select Product --</option>` +
        items
            .map(
                item =>
                    `<option value="${item.ItemID}">${item.ItemName}</option>`
            )
            .join("");
}

import { DOM } from "../core/dom.js";
import { fetchItemOptions } from "../services/stockService.js";
import { loadStock } from "../stock.js";
import { resetStockForm, setItemOptions } from "../views/stock.view.js";
import { apiFetch } from "../services/api.js";

let initialized = false;

export async function initStockView() {
    if (initialized) return;

    try {
        const items = await fetchItemOptions();
        if (!Array.isArray(items)) return;

        setItemOptions(items);
        initialized = true;
    } catch {}
}

function attachStockEvents() {
    if (!DOM.stock.form) return;

    DOM.stock.form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const itemID = DOM.stock.itemSelect.value;
        const qty = Number(DOM.stock.quantity.value);
        const mfg = DOM.stock.mfgDate.value;
        const exp = DOM.stock.expDate.value;

        if (!itemID || !qty || !mfg || !exp) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await apiFetch("/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ItemID: itemID,
                    Quantity: qty,
                    ManufactureDate: mfg,
                    ExpiryDate: exp
                })
            });

            if (!res) return;

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to add stock");
            }

            resetStockForm();
            await loadStock();
            alert("Stock added successfully");

        } catch (err) {
            alert(err.message);
        }
    });
}

attachStockEvents();
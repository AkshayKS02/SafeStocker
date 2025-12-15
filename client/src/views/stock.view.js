import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";
import { loadItemOptions, loadStock } from "../stock.js";

let initialized = false;

export function initStockView() {
    if (initialized) return;
    initialized = true;

    populateItemDropdown();
    attachStockFormHandler();
}

async function populateItemDropdown() {
    log("Populating stock item dropdown", "action");
    await loadItemOptions(DOM.stock.itemSelect);
}

function attachStockFormHandler() {
    if (!DOM.stock.form) {
        log("Stock form not found", "error");
        return;
    }

    DOM.stock.form.addEventListener("submit", async (e) => {
        e.preventDefault();
        log("Add Stock form submitted", "click");

        const itemID = DOM.stock.itemSelect.value;
        const qty = Number(DOM.stock.quantity.value);
        const mfg = DOM.stock.mfgDate.value;
        const exp = DOM.stock.expDate.value;

        if (!itemID || !qty || !mfg || !exp) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ItemID: itemID,
                    Quantity: qty,
                    ManufactureDate: mfg,
                    ExpiryDate: exp
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to add stock");
            }

            log("Stock added successfully", "success");
            alert("Stock added successfully");

            DOM.stock.form.reset();

            await loadStock();

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    log("Stock form handler attached", "attach");
}

// src/events/entry.events.js
import { DOM } from "../core/dom.js";
import { state } from "../core/state.js";
import { loadStock } from "../stock.js";
import { createItem } from "../services/itemService.js";
import {
    showStandardForm,
    showCustomForm,
    hideScanPreview
} from "../views/entry.view.js";

function attachEntryEvents() {

    // Toggle buttons
    if (DOM.entry.standardToggle && DOM.entry.customToggle) {
        DOM.entry.standardToggle.onclick = showStandardForm;
        DOM.entry.customToggle.onclick = showCustomForm;

        showStandardForm(); // default
    }

    // Standard form submit
    if (DOM.entry.formStandard) {
        DOM.entry.formStandard.addEventListener("submit", async (e) => {
            e.preventDefault();

            const scanned = state.scannedItem;
            if (!scanned?.barcode) {
                alert("Please scan a barcode first");
                return;
            }

            const price = Number(DOM.entry.price?.value);
            if (!price || price <= 0) {
                alert("Enter a valid price");
                return;
            }

            const payload = {
                ItemName: scanned.name || "Unnamed Product",
                Barcode: scanned.barcode,
                CategoryID: 1,
                Source: "API",
                Price: price
            };

            try {
                await createItem(payload);

                DOM.entry.formStandard.reset();
                hideScanPreview();
                await loadStock();

                alert("Item saved successfully");
            } catch (err) {
                alert(err.message);
            }
        });
    }
}

attachEntryEvents();

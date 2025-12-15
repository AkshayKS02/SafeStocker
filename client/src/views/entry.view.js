import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";
import { state } from "../core/state.js";
import { loadStock } from "../stock.js";

log("entry.view.js loaded", "info");

function switchFormToggle(showForm, activeToggle, inactiveToggle) {
    DOM.entry.formStandard.style.display = "none";
    DOM.entry.formCustom.style.display = "none";
    showForm.style.display = "block";

    activeToggle.classList.add("active-toggle");
    inactiveToggle.classList.remove("active-toggle");

    if (DOM.entry.scanPreview) {
        DOM.entry.scanPreview.style.display = "none";
    }

    state.scannedItem = null;
}

function attachEntryListeners() {

    if (DOM.entry.standardToggle && DOM.entry.customToggle) {
        DOM.entry.standardToggle.onclick = () =>
            switchFormToggle(
                DOM.entry.formStandard,
                DOM.entry.standardToggle,
                DOM.entry.customToggle
            );

        DOM.entry.customToggle.onclick = () =>
            switchFormToggle(
                DOM.entry.formCustom,
                DOM.entry.customToggle,
                DOM.entry.standardToggle
            );

        switchFormToggle(
            DOM.entry.formStandard,
            DOM.entry.standardToggle,
            DOM.entry.customToggle
        );
    }

    if (DOM.entry.formStandard) {
        DOM.entry.formStandard.addEventListener("submit", async (e) => {
            e.preventDefault();
            log("Standard Form Submission clicked", "click");

            const scanned = state.scannedItem || {};

            if (!scanned.barcode) {
                alert("Please scan a barcode before saving.");
                return;
            }

            const price = Number(DOM.entry.price?.value);

            if (!price || price <= 0) {
                alert("Please enter a valid price");
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
                const res = await fetch("http://localhost:5000/items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to save item");
                }

                log("Item saved", "success");
                alert("Item saved successfully");

                DOM.entry.formStandard.reset();
                state.scannedItem = null;

                if (DOM.entry.scanPreview) {
                    DOM.entry.scanPreview.style.display = "none";
                }

                await loadStock();

            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    }
}

attachEntryListeners();
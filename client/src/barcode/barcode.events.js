// src/barcode/barcode.events.js
import { DOM } from "../core/dom.js";
import { state } from "../core/state.js";
import { updateScanPreview } from "./barcode.ui.js";
import { attachCustomBarcodeGenerator } from "./customBarcode.js";

function handleScannedProduct(data) {
    const p = data.product;
    if (!p || !p.barcode) return;

    state.scannedItem = {
        barcode: String(p.barcode).trim(),
        name: p.name || "Scanned Item",
        brand: p.brand || ""
    };

    if (
        DOM.views.entry?.style.display === "block" &&
        DOM.entry.formStandard?.style.display === "block"
    ) {
        updateScanPreview(state.scannedItem);
    }
}

function attachEntryScanListener() {
    if (!DOM.entry.scanBtn) return;

    DOM.entry.scanBtn.addEventListener("click", async () => {
        try {
            const scanRes = await fetch("/run-scanner");
            const { barcode } = await scanRes.json();
            if (!barcode) {
                alert("Scanner failed");
                return;
            }

            const res = await fetch("/barcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ barcode })
            });

            const data = await res.json();
            if (!data.found) {
                alert("Product not found");
                return;
            }

            handleScannedProduct(data);

        } catch {
            alert("Barcode scan failed");
        }
    });
}

attachEntryScanListener();
attachCustomBarcodeGenerator();
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";
import { state } from "../core/state.js";
import { updateScanPreview } from "./barcode.ui.js";

log("barcode.events.js loaded", "info");

function handleScannedProduct(data) {
    const p = data.product;
    const code = String(p.barcode || "").trim();

    if (!code) return;

    state.scannedItem = {
        barcode: code,
        name: p.name || "Scanned Item",
        brand: p.brand || "",
        package_quantity: p.package_quantity || ""
    };

    if (
        DOM.views.entry &&
        DOM.views.entry.style.display === "block" &&
        DOM.entry.formStandard.style.display === "block"
    ) {
        updateScanPreview(state.scannedItem);
    }
}

function attachEntryScanListener() {
    if (!DOM.entry.scanBtn) return;

    DOM.entry.scanBtn.addEventListener("click", async () => {
        try {
            const resScan = await fetch("http://localhost:5000/run-scanner");
            const scanData = await resScan.json();
            const barcode = scanData.barcode;

            if (!barcode) {
                alert("Scanner failed");
                return;
            }

            const res = await fetch("http://localhost:5000/barcode", {
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

        } catch (err) {
            console.error(err);
            alert("Barcode scan failed");
        }
    });
}

attachEntryScanListener();

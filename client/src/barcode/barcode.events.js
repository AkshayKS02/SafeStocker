// src/barcode/barcode.events.js
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";
import { state } from "../core/state.js";
import { updateScanPreview } from "./barcode.ui.js";

log("barcode.events.js loaded", 'info');

/**
 * Normalizes and stores the scanned product data.
 */
function handleScannedProduct(data) {
    log("handleScannedProduct() start", 'action');
    const p = data.product;
    const code = String(p.barcode || "").trim();

    if (!code) {
        log("Scanned product has no barcode, skipping.", 'error');
        return;
    }
    
    state.scannedItem = {
        barcode: code,
        name: p.name || "Scanned Item",
        // The original app.js used: brand, package_quantity, manufacture_date, expiry_date
        brand: p.brand || "",
        package_quantity: p.package_quantity || "",
        manufacture_date: p.manufacture_date || "",
        expiry_date: p.expiry_date || "",
    };
    log(`Scanned item saved to state: ${state.scannedItem.name} (${code})`, 'success');

    // Only update UI if the Entry View is currently visible AND the form is Standard
    if (
        DOM.views.entry && 
        DOM.views.entry.style.display === "block" &&
        DOM.entry.formStandard.style.display === "block"
    ) {
        updateScanPreview(state.scannedItem);
    }
    log("handleScannedProduct() end", 'end');
}


/**
 * Logic for the dedicated 'Scan' button on the Entry View.
 */
function attachEntryScanListener() {
    if (!DOM.entry.scanBtn) {
        log("Entry View Scan Button NOT found", 'error');
        return;
    }
    
    DOM.entry.scanBtn.addEventListener("click", async () => {
        log("Dedicated Scan button clicked (Entry View)", 'click');

        try {
            // 1. Run scanner to get code
            const resScan = await fetch("http://localhost:5000/run-scanner");
            const dataScan = await resScan.json();
            const barcode = dataScan.barcode;

            if (!barcode) {
                log("Scanner returned no barcode.", 'error');
                alert("Scanner failed to read a barcode.");
                return;
            }
            log(`Scanner result: ${barcode}`, 'info');

            // 2. Fetch product details
            const resDetails = await fetch(`http://localhost:5000/barcode/details/${barcode}`);
            const productData = await resDetails.json();

            // 3. Process and update UI
            handleScannedProduct({ product: productData.product, barcode });
            updateScanPreview(state.scannedItem);

        } catch (err) {
            log(`Entry Scan error: ${err.message}`, 'error');
            alert("Barcode scan failed. Check console and server.");
        }
    });

    log("Listener attached to dedicated Entry View Scan button", 'attach');
}


/**
 * Initiates background barcode polling.
 */
function startBackgroundPolling() {
    log("Background barcode polling started (interval: 1500ms)", 'action');
    
    setInterval(async () => {
        // Only poll if the Entry View is NOT active (prevent conflicts with dedicated scan)
        if (DOM.views.entry && DOM.views.entry.style.display === "block") {
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/barcode/latest");
            const data = await res.json();
            
            if (data.product) {
                log("Barcode polling found a new product.", 'info');
                handleScannedProduct(data);
            }
        } catch (err) {
            // Silence common connection errors for cleaner console, but log specific error
            if (err.message && err.message.includes("Failed to fetch")) return;
            // log(`Background Polling error: ${err.message}`, 'error'); 
        }
    }, 1500);
}

// Call to attach the listeners and start the polling when the file loads
attachEntryScanListener();
startBackgroundPolling();
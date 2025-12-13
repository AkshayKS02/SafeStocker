// src/barcode/barcode.ui.js
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";

log("barcode.ui.js loaded", 'info');

/**
 * Updates the Entry View UI with the scanned product details.
 * @param {object} scannedItem - The item object from the scan result.
 */
export function updateScanPreview(scannedItem) {
    log("updateScanPreview() start", 'action');

    if (!DOM.entry.scanPreview) {
        log("Scan preview box NOT found", 'error');
        return;
    }
    
    if (DOM.entry.scanNameField) DOM.entry.scanNameField.innerText = scannedItem.name || "Unnamed Product";
    if (DOM.entry.scanCodeField) DOM.entry.scanCodeField.innerText = scannedItem.barcode || "N/A";

    DOM.entry.scanPreview.style.display = "flex";
    log(`Scan preview updated for: ${scannedItem.name}`, 'ui');

    log("updateScanPreview() end", 'end');
}
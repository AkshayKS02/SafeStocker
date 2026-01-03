// src/barcode/barcode.ui.js
import { DOM } from "../core/dom.js";

export function updateScanPreview(item) {
    if (!DOM.entry.scanPreview) return;

    DOM.entry.scanNameField.textContent =
        item.name || "Unnamed Product";

    DOM.entry.scanCodeField.textContent =
        item.barcode || "N/A";

    DOM.entry.scanPreview.style.display = "flex";
}

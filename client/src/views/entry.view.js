// src/views/entry.view.js
import { DOM } from "../core/dom.js";
import { state } from "../core/state.js";

export function showStandardForm() {
    DOM.entry.formStandard.style.display = "block";
    DOM.entry.formCustom.style.display = "none";
    DOM.entry.standardToggle.classList.add("active-toggle");
    DOM.entry.customToggle.classList.remove("active-toggle");
    hideScanPreview();
}

export function showCustomForm() {
    DOM.entry.formStandard.style.display = "none";
    DOM.entry.formCustom.style.display = "block";
    DOM.entry.customToggle.classList.add("active-toggle");
    DOM.entry.standardToggle.classList.remove("active-toggle");
    hideScanPreview();
}

export function hideScanPreview() {
    if (DOM.entry.scanPreview) {
        DOM.entry.scanPreview.style.display = "none";
    }
    state.scannedItem = null;
}

export function showScanPreview(scannedItem) {
    if (!DOM.entry.scanPreview) return;

    DOM.entry.scanNameField.textContent = scannedItem.name || "Unnamed Product";
    DOM.entry.scanCodeField.textContent = scannedItem.barcode || "N/A";
    DOM.entry.scanPreview.style.display = "flex";
}

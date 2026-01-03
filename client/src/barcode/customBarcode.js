import { DOM } from "../core/dom.js";
import { state } from "../core/state.js";

export function attachCustomBarcodeGenerator() {
    const btn = DOM.entry.customBarcode.generateBtn;
    if (!btn) return;

    btn.addEventListener("click", () => {
        const code = `${Date.now()}`;

        const url = `https://barcodeapi.org/api/128/${encodeURIComponent(code)}`;

        // store in global state
        state.scannedItem = {
            barcode: code,
            name: "Custom Item",
            source: "CUSTOM"
        };

        // update UI
        DOM.entry.customBarcode.img.src = url;
        DOM.entry.customBarcode.text.textContent = code;
        DOM.entry.customBarcode.preview.style.display = "block";
    });
}

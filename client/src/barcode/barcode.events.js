import { DOM } from "../core/dom.js";
import { state } from "../core/state.js";
import { updateScanPreview } from "./barcode.ui.js";
import { attachCustomBarcodeGenerator } from "./customBarcode.js";
import { apiFetch } from "../services/api.js";

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

let scannerActive = false;

function attachEntryScanListener() {
    if (!DOM.entry.scanBtn) return;

    DOM.entry.scanBtn.addEventListener("click", async () => {
        if (scannerActive) return;
        scannerActive = true;

        const modal = document.createElement("div");
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;";

        const video = document.createElement("video");
        video.style.cssText = "max-width:90%;max-height:70%;border:2px solid #fff;border-radius:8px;";

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Cancel";
        closeBtn.style.cssText = "padding:10px 24px;background:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;";

        modal.appendChild(video);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        if (typeof ZXing === "undefined") {
            document.body.removeChild(modal);
            scannerActive = false;
            alert("Barcode library not loaded. Check your internet connection and refresh.");
            return;
        }

        const codeReader = new ZXing.BrowserMultiFormatReader();

        try {
            // Request camera permission and enumerate devices natively
            await navigator.mediaDevices.getUserMedia({ video: true });

            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === "videoinput");

            if (!videoDevices.length) {
                document.body.removeChild(modal);
                scannerActive = false;
                alert("No camera found on this device.");
                return;
            }

            // Prefer back camera on mobile, last device on desktop
            const device = videoDevices.find(d => /back|rear|environment/i.test(d.label)) || videoDevices[videoDevices.length - 1];

            codeReader.decodeFromVideoDevice(device.deviceId, video, async (result, err) => {
                if (!result) return;

                codeReader.reset();
                if (document.body.contains(modal)) document.body.removeChild(modal);
                scannerActive = false;

                const barcode = result.getText();

                const res = await apiFetch("/barcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ barcode })
                });

                if (!res) return;
                const data = await res.json();

                if (!data.found) {
                    alert("Product not found");
                    return;
                }

                handleScannedProduct(data);
            });

            closeBtn.onclick = () => {
                codeReader.reset();
                if (document.body.contains(modal)) document.body.removeChild(modal);
                scannerActive = false;
            };

        } catch (err) {
            codeReader.reset();
            if (document.body.contains(modal)) document.body.removeChild(modal);
            scannerActive = false;

            if (err.name === "NotAllowedError") {
                alert("Camera permission denied. Please allow camera access in your browser settings and try again.");
            } else if (err.name === "NotFoundError") {
                alert("No camera found on this device.");
            } else if (err.name === "NotReadableError") {
                alert("Camera is already in use by another application.");
            } else {
                alert("Camera error: " + err.message);
            }
        }
    });
}

attachEntryScanListener();
attachCustomBarcodeGenerator();
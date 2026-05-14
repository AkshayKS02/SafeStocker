import { apiFetch } from "./api.js";

let scannerActive = false;

export async function generateInvoice(payload) {
    const res = await apiFetch("/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res) throw new Error("Unauthorized");

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Billing failed");
    }

    return await res.blob();
}

export async function scanBarcode() {
    console.debug("[Billing Scanner] scanBarcode() invoked");

    if (scannerActive) {
        console.warn("[Billing Scanner] Scanner is already active");
        throw new Error("Barcode scanner is already open.");
    }

    if (typeof ZXing === "undefined") {
        console.error("[Billing Scanner] ZXing library is not available");
        throw new Error("Barcode library not loaded. Check your internet connection and refresh.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        console.error("[Billing Scanner] Camera API is not available in this browser");
        throw new Error("Camera access is not supported by this browser.");
    }

    scannerActive = true;

    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;";

    const video = document.createElement("video");
    video.style.cssText = "max-width:90%;max-height:70%;border:2px solid #fff;border-radius:8px;";
    video.setAttribute("playsinline", "true");

    const status = document.createElement("div");
    status.textContent = "Point your camera at a barcode";
    status.style.cssText = "color:#fff;font-size:14px;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cancel";
    closeBtn.style.cssText = "padding:10px 24px;background:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;";

    modal.appendChild(video);
    modal.appendChild(status);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);

    const codeReader = new ZXing.BrowserMultiFormatReader();
    let settled = false;
    let cleanedUp = false;

    const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        console.debug("[Billing Scanner] Cleaning up scanner resources");
        codeReader.reset();
        if (document.body.contains(modal)) document.body.removeChild(modal);
        scannerActive = false;
    };

    try {
        console.debug("[Billing Scanner] Requesting camera permission");
        const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true });
        permissionStream.getTracks().forEach(track => track.stop());

        console.debug("[Billing Scanner] Enumerating video devices");
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === "videoinput");

        console.debug("[Billing Scanner] Video devices found", videoDevices);

        if (!videoDevices.length) {
            cleanup();
            throw new Error("No camera found on this device.");
        }

        const device =
            videoDevices.find(d => /back|rear|environment/i.test(d.label)) ||
            videoDevices[videoDevices.length - 1];

        console.debug("[Billing Scanner] Starting camera", {
            deviceId: device.deviceId,
            label: device.label
        });

        return await new Promise((resolve, reject) => {
            closeBtn.onclick = () => {
                if (settled) return;
                settled = true;
                console.debug("[Billing Scanner] Scan cancelled by user");
                cleanup();
                resolve(null);
            };

            codeReader
                .decodeFromVideoDevice(device.deviceId, video, (result, err) => {
                    if (settled) return;

                    if (result) {
                        settled = true;
                        const barcode = result.getText();
                        console.debug("[Billing Scanner] Barcode decoded", barcode);
                        cleanup();
                        resolve(barcode);
                        return;
                    }

                    if (err && err.name !== "NotFoundException") {
                        console.debug("[Billing Scanner] Decode callback error", err);
                    }
                })
                .catch(err => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    reject(err);
                });
        });
    } catch (err) {
        cleanup();
        console.error("[Billing Scanner] Camera startup failed", err);

        if (err.name === "NotAllowedError") {
            throw new Error("Camera permission denied. Please allow camera access in your browser settings and try again.");
        }
        if (err.name === "NotFoundError") {
            throw new Error("No camera found on this device.");
        }
        if (err.name === "NotReadableError") {
            throw new Error("Camera is already in use by another application.");
        }

        throw err;
    }
}

// src/views/entry.view.js
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";
import { state } from "../core/state.js";
import { loadStock } from "../stock.js";

log("entry.view.js loaded", 'info');

/**
 * Handles switching between Standard and Custom entry forms.
 */
function switchFormToggle(showForm, activeToggle, inactiveToggle) {
    log("switchFormToggle() start", 'action');

    if (!DOM.entry.formStandard || !DOM.entry.formCustom) {
        log("Standard or Custom form element missing", 'error');
        return;
    }

    DOM.entry.formStandard.style.display = "none";
    DOM.entry.formCustom.style.display = "none";
    showForm.style.display = "block";
    log(`Form displayed: ${showForm.id}`, 'ui');

    activeToggle.classList.add("active-toggle");
    inactiveToggle.classList.remove("active-toggle");
    log(`Toggles updated: ${activeToggle.id} active`, 'ui');
    
    // Hide the scan preview when toggling
    if (DOM.entry.scanPreview) {
        DOM.entry.scanPreview.style.display = "none";
    }

    state.scannedItem = null; // Clear state on toggle
    log("Scan preview hidden and state reset on toggle", 'ui');

    log("switchFormToggle() end", 'end');
}

/**
 * Attaches listeners for form toggles and form submission.
 */
function attachEntryListeners() {
    log("attachEntryListeners() start", 'action');

    // 1. Form Toggles
    if (DOM.entry.standardToggle && DOM.entry.customToggle) {
        DOM.entry.standardToggle.onclick = () =>
            switchFormToggle(DOM.entry.formStandard, DOM.entry.standardToggle, DOM.entry.customToggle);
        DOM.entry.customToggle.onclick = () =>
            switchFormToggle(DOM.entry.formCustom, DOM.entry.customToggle, DOM.entry.standardToggle);
            
        // Set initial state
        switchFormToggle(DOM.entry.formStandard, DOM.entry.standardToggle, DOM.entry.customToggle);
        
        log("Listeners attached to entry form toggles", 'attach');
    } else {
        log("Entry form toggles NOT found", 'error');
    }

    // 2. Standard Form Submission
    if (DOM.entry.formStandard) {
        DOM.entry.formStandard.addEventListener("submit", async (e) => {
            log("Standard Form Submission clicked", 'click');
            e.preventDefault();

            const quantity = DOM.entry.quantity.value.trim();
            const mfg = DOM.entry.mfgDate.value.trim();
            const exp = DOM.entry.expDate.value.trim();
            const scanned = state.scannedItem || {};

            if (!scanned.barcode) {
                log("Save failed: No barcode scanned", 'error');
                return alert("Please scan a barcode before saving.");
            }

            const newItem = {
                barcode: scanned.barcode,
                name: scanned.name || "Unnamed Product",
                quantity,
                manufacture_date: mfg,
                expiry_date: exp,
            };
            log("Attempting to save new item:", 'info');
            console.log(newItem);

            try {
                const res = await fetch("http://localhost:5000/items/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newItem),
                });
                const data = await res.json();
                
                if (data.success) {
                    log("Item saved successfully!", 'success');
                    alert("Item saved successfully!");
                    
                    await loadStock();
                    
                    DOM.entry.formStandard.reset();
                    log("Standard form reset", 'ui');
                    
                    if (DOM.entry.scanPreview) {
                        DOM.entry.scanPreview.style.display = "none";
                    }
                    state.scannedItem = null;
                    log("Scan preview hidden and state reset", 'ui');
                } else {
                    log(`Save failed: ${data.message || "Server error"}`, 'error');
                    alert("Failed to save item: " + (data.message || "Check server logs."));
                }
            } catch (err) {
                log(`Save fetch error: ${err.message}`, 'error');
                alert("Failed to save item. Check console.");
            }
        });
        log("Listener attached to standard form submission", 'attach');
    } else {
        log("Standard form NOT found", 'error');
    }

    log("attachEntryListeners() end", 'end');
}

// Call to attach the listeners when the file loads
attachEntryListeners();
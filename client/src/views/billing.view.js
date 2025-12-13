// src/views/billing.view.js
import { DOM } from "../core/dom.js";
import { STOCK_ITEMS } from "../stock.js";
import { log } from "../utils/logger.js";

log("billing.view.js loaded", 'info');

/**
 * Renders the list of products for the billing view.
 */
export function renderBillingProducts(list) {
    log("renderBillingProducts() start", 'action');
    const box = DOM.billing.productsBox;

    if (!box) {
        log("Billing products box NOT found", 'error');
        return;
    }

    const html =
        "<h3>Products</h3>" +
        list
            .map(
                // Note: Hardcoding price to 100 as the original code hardcoded it to 0
                (item) => `
          <div class="billing-product-card">
            <div>
              <div class="bill-item-name">${item.name}</div>
              <div class="bill-item-barcode">${item.barcode}</div>
            </div>
            <button class="add-bill-btn" data-name="${item.name}" data-price="100">Add</button>
          </div>
        `
            )
            .join("");

    box.innerHTML = html;
    log(`Rendered ${list.length} billing products`, 'ui');
    log("renderBillingProducts() end", 'end');
}

/**
 * Attaches the search input and Add button listeners.
 */
function attachBillingListeners() {
    log("attachBillingListeners() start", 'action');

    // 1. Search Input Listener
    if (DOM.billing.search) {
        DOM.billing.search.addEventListener("input", () => {
            log("Billing search input changed", 'click');
            const q = DOM.billing.search.value.toLowerCase();
            const filtered = STOCK_ITEMS.filter(
                (i) => i.name.toLowerCase().includes(q) || i.barcode.includes(q)
            );
            renderBillingProducts(filtered);
        });
        log("Listener attached to billing search", 'attach');
    } else {
        log("Billing search input NOT found", 'error');
    }


    // 2. Add to Bill Button Listener (Delegated)
    document.addEventListener("click", function (e) {
        if (!e.target.classList.contains("add-bill-btn")) return;
        
        log("Add to bill button clicked", 'click');

        const name = e.target.dataset.name;
        const price = parseInt(e.target.dataset.price) || 100; 

        const container = DOM.billing.billItemsContainer;
        const totalBox = DOM.billing.billTotalBox;

        if (container && totalBox) {
            container.innerHTML += `
                <div class="bill-line" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${name}</span>
                    <span>₹${price}</span>
                </div>`;
            
            const currentTotalText = totalBox.innerText.replace("₹", "") || "0";
            const current = parseInt(currentTotalText);
            const newTotal = current + price;
            totalBox.innerText = "₹" + newTotal;
            
            log(`Added ${name} (₹${price}) to bill. New total: ₹${newTotal}`, 'ui');
        } else {
            log("Bill container or total box NOT found", 'error');
        }
    });
    log("Delegated listener attached for add-bill-btn", 'attach');

    log("attachBillingListeners() end", 'end');
}

// Call to attach the listeners when the file loads
attachBillingListeners();
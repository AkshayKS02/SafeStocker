// src/views/billing.view.js
import { DOM } from "../core/dom.js";

export function renderBillingProducts(list) {
    const box = DOM.billing.productsBox;
    if (!box) return;

    box.innerHTML =
        "<h3>Products</h3>" +
        list.map(item => `
            <div class="billing-product-card">
                <div>
                    <div class="bill-item-name">${item.name}</div>
                    <div class="bill-item-barcode">${item.barcode}</div>
                    <div class="bill-item-price">₹${item.price}</div>
                    <div class="bill-item-stock">In stock: ${item.inStock}</div>
                </div>
                <button 
                    class="add-bill-btn"
                    data-id="${item.itemID}">
                    Add
                </button>
            </div>
        `).join("");
}

export function renderBillLines(billItems) {
    const container = DOM.billing.billItemsContainer;
    const totalBox = DOM.billing.billTotalBox;

    if (!container || !totalBox) return;

    let total = 0;
    container.innerHTML = "";

    billItems.forEach(item => {
        const lineTotal = item.qty * item.price;
        total += lineTotal;

        container.innerHTML += `
            <div class="bill-line">
                <span>${item.name}</span>

                <div class="bill-qty-controls">
                    <button class="qty-btn minus" data-id="${item.itemID}">−</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.itemID}">+</button>
                </div>

                <span>₹${lineTotal}</span>
            </div>
        `;
    });

    totalBox.textContent = "₹" + total;
}

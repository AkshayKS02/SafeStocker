// src/events/billing.events.js
import { DOM } from "../core/dom.js";
import { stockItems, loadStock } from "../stock.js";
import { renderBillingProducts, renderBillLines } from "../views/billing.view.js";
import { generateInvoice, scanBarcode } from "../services/billingService.js";

let billItems = [];

// Get current available stock for an item
function getAvailableStock(itemID) {
    const item = stockItems.find(i => i.itemID === itemID);
    return item ? item.inStock : 0;
}

// Add item to bill or increase quantity
function addToBill(item) {
    const existing = billItems.find(i => i.itemID === item.itemID);
    const available = getAvailableStock(item.itemID);

    if (existing) {
        if (existing.qty < available) {
            existing.qty += 1;
        }
    } else if (available > 0) {
        billItems.push({
            itemID: item.itemID,
            name: item.name,
            price: item.price,
            qty: 1
        });
    }

    renderBillLines(billItems);
}

function attachBillingEvents() {

    // Search products
    if (DOM.billing.search) {
        DOM.billing.search.addEventListener("input", () => {
            const q = DOM.billing.search.value.toLowerCase();
            const filtered = stockItems.filter(
                i =>
                    i.name.toLowerCase().includes(q) ||
                    i.barcode.includes(q)
            );
            renderBillingProducts(filtered);
        });
    }

    // Add button clicks
    if (DOM.billing.productsBox) {
        DOM.billing.productsBox.addEventListener("click", (e) => {
            if (!e.target.classList.contains("add-bill-btn")) return;

            const id = Number(e.target.dataset.id);
            const item = stockItems.find(i => i.itemID === id);
            if (item) addToBill(item);
        });
    }

    // Quantity controls
    if (DOM.billing.billItemsContainer) {
        DOM.billing.billItemsContainer.addEventListener("click", (e) => {
            if (!e.target.classList.contains("qty-btn")) return;

            const id = Number(e.target.dataset.id);
            const item = billItems.find(i => i.itemID === id);
            if (!item) return;

            if (e.target.classList.contains("plus")) {
                if (item.qty < getAvailableStock(id)) {
                    item.qty += 1;
                }
            }

            if (e.target.classList.contains("minus")) {
                item.qty -= 1;
                if (item.qty <= 0) {
                    billItems = billItems.filter(i => i.itemID !== id);
                }
            }

            renderBillLines(billItems);
        });
    }

    // Generate invoice
    const generateBtn = document.querySelector(".generate-bill-btn");
    if (generateBtn) {
        generateBtn.addEventListener("click", async () => {
            if (billItems.length === 0) {
                alert("Bill is empty");
                return;
            }

            const subtotal = billItems.reduce(
                (sum, i) => sum + i.qty * i.price,
                0
            );

            const payload = {
                invoice_no: Date.now(),
                date: new Date().toISOString().split("T")[0],
                customer: { name: "Walk-in Customer" },
                items: billItems.map(i => ({
                    itemID: i.itemID,
                    qty: i.qty
                }))
            };


            try {
                const blob = await generateInvoice(payload);
                const url = URL.createObjectURL(blob);
                window.open(url);

                billItems = [];
                renderBillLines(billItems);

                await loadStock();
                renderBillingProducts(stockItems);

            } catch (err) {
                alert(err.message);
            }
        });
    }

    // Scan barcode
    const scanBtn = document.querySelector(".billing-scan-btn");
    if (scanBtn) {
        scanBtn.addEventListener("click", async () => {
            const code = await scanBarcode();
            if (!code) {
                alert("No barcode scanned");
                return;
            }

            const item = stockItems.find(i => i.barcode === code);
            if (!item) {
                alert("Item not found in stock");
                return;
            }

            addToBill(item);
        });
    }
}

attachBillingEvents();


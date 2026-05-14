// src/events/billing.events.js
import { DOM } from "../core/dom.js";
import { stockItems, loadStock } from "../stock.js";
import { renderBillingProducts, renderBillLines } from "../views/billing.view.js";
import { generateInvoice, scanBarcode } from "../services/billingService.js";

let billItems = [];
let billingScanListenerAttached = false;

function normalizeBarcode(value) {
    return String(value ?? "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
}

// Get current available stock for an item
function getAvailableStock(itemID) {
    const item = stockItems.find(i => i.itemID === itemID);
    return item ? item.inStock : 0;
}

// Add item to bill or increase quantity
function addToBill(item) {
    console.debug("[Billing] addToBill() called", item);

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

function findStockItemByBarcode(code) {
    const normalizedCode = normalizeBarcode(code);
    console.debug("[Billing Scan] Looking up scanned barcode", {
        raw: code,
        normalized: normalizedCode
    });

    const item = stockItems.find(i => normalizeBarcode(i.barcode) === normalizedCode);

    if (!item) {
        console.warn("[Billing Scan] No stock item matched barcode", normalizedCode);
        console.debug(
            "[Billing Scan] Available stock barcodes",
            stockItems.map(i => ({
                itemID: i.itemID,
                name: i.name,
                barcode: i.barcode,
                normalizedBarcode: normalizeBarcode(i.barcode)
            }))
        );
    } else {
        console.debug("[Billing Scan] Matched stock item", item);
    }

    return item;
}

function attachBillingScanListener() {
    const initialButton = document.querySelector(".billing-scan-btn");
    console.debug("[Billing Scan] Button selection during setup", initialButton);

    if (billingScanListenerAttached) {
        console.debug("[Billing Scan] Delegated listener already attached");
        return;
    }

    // The billing view can be rendered or replaced after this module loads, so use
    // one delegated listener instead of binding directly to a possibly stale button.
    document.addEventListener("click", async (e) => {
        if (!(e.target instanceof Element)) return;

        const scanBtn = e.target.closest(".billing-scan-btn");
        if (!scanBtn) return;

        console.debug("[Billing Scan] Scan button clicked", scanBtn);

        try {
            console.debug("[Billing Scan] Calling scanBarcode()");
            const code = await scanBarcode();
            const normalizedCode = normalizeBarcode(code);

            console.debug("[Billing Scan] Scanned barcode result", {
                raw: code,
                normalized: normalizedCode
            });

            if (!normalizedCode) {
                alert("No barcode scanned");
                return;
            }

            const item = findStockItemByBarcode(normalizedCode);
            if (!item) {
                alert("Item not found in stock. Check the console for available stock barcodes.");
                return;
            }

            addToBill(item);
        } catch (err) {
            console.error("[Billing Scan] Barcode scanner failed", err);
            alert(err?.message || "Barcode scanner failed. Please try again.");
        }
    });

    billingScanListenerAttached = true;
    console.debug("[Billing Scan] Delegated click handler registered");
}

function attachBillingEvents() {

    // Search products
    if (DOM.billing.search) {
        DOM.billing.search.addEventListener("input", () => {
            const q = DOM.billing.search.value.toLowerCase();
            const filtered = stockItems.filter(
                i =>
                    i.name.toLowerCase().includes(q) ||
                    normalizeBarcode(i.barcode).toLowerCase().includes(q)
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

    attachBillingScanListener();
}

attachBillingEvents();


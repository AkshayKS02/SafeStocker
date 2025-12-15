// src/views/billing.view.js
import { DOM } from "../core/dom.js";
import { STOCK_ITEMS } from "../stock.js";
import { log } from "../utils/logger.js";

log("billing.view.js loaded", "info");

// -------------------- BILL STATE --------------------
let BILL_ITEMS = [];

// -------------------- RENDER PRODUCTS --------------------
export function renderBillingProducts(list) {
  log("renderBillingProducts() start", "action");

  const box = DOM.billing.productsBox;
  if (!box) {
    log("Billing products box NOT found", "error");
    return;
  }

  box.innerHTML =
    "<h3>Products</h3>" +
    list
      .map(
        (item) => `
            <div class="billing-product-card">
                <div>
                    <div class="bill-item-name">${item.name}</div>
                    <div class="bill-item-barcode">${item.barcode}</div>
                    <div class="bill-item-price">₹${item.price}</div>
                    <div class="bill-item-stock">In stock: ${item.inStock}</div>
                </div>
                <button 
                    class="add-bill-btn"
                    data-id="${item.itemID}"
                    ${item.inStock === 0 ? "disabled" : ""}>
                    Add
                </button>
            </div>
        `
      )
      .join("");

  log(`Rendered ${list.length} billing products`, "ui");
  log("renderBillingProducts() end", "end");
}

// -------------------- BILL LOGIC --------------------
function addToBill(item) {
  const existing = BILL_ITEMS.find(i => i.itemID === item.itemID);
  const available = getAvailableStock(item.itemID);

  if (existing) {
    if (existing.qty < available) {
      existing.qty += 1;
    }
  } else {
    if (available > 0) {
      BILL_ITEMS.push({
        itemID: item.itemID,
        name: item.name,
        price: item.price,
        qty: 1
      });
    }
  }

  renderBill();
}


function renderBill() {
  const container = DOM.billing.billItemsContainer;
  const totalBox = DOM.billing.billTotalBox;

  if (!container || !totalBox) {
    log("Bill container or total box missing", "error");
    return;
  }

  container.innerHTML = "";
  let total = 0;

  BILL_ITEMS.forEach((item) => {
    const lineTotal = item.qty * item.price;
    total += lineTotal;

    container.innerHTML += `
            <div class="bill-line" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span>${item.name}</span>

                <div style="display:flex; gap:8px; align-items:center;">
                <button class="qty-btn minus" data-id="${item.itemID}">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn plus" data-id="${item.itemID}">+</button>
                </div>

                <span>₹${lineTotal}</span>
            </div>
            `;
  });

  totalBox.innerText = "₹" + total;
}

// -------------------- EVENT LISTENERS --------------------
function attachBillingListeners() {
  log("attachBillingListeners() start", "action");

  // 🔍 Search
  if (DOM.billing.search) {
    DOM.billing.search.addEventListener("input", () => {
      const q = DOM.billing.search.value.toLowerCase();
      const filtered = STOCK_ITEMS.filter(
        (i) => i.name.toLowerCase().includes(q) || i.barcode.includes(q)
      );
      renderBillingProducts(filtered);
    });
    log("Billing search listener attached", "attach");
  }

  // ➕ Add to bill (delegated)
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("add-bill-btn")) return;

    const id = Number(e.target.dataset.id);
    const item = STOCK_ITEMS.find((i) => i.itemID === id);

    if (!item) {
      log("Item not found in STOCK_ITEMS", "error");
      return;
    }

    addToBill(item);
  });

  // 🧾 Generate Bill
  const generateBtn = document.querySelector(".generate-bill-btn");
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      if (BILL_ITEMS.length === 0) {
        alert("Bill is empty");
        return;
      }

      const subtotal = BILL_ITEMS.reduce((sum, i) => sum + i.qty * i.price,0);

        const payload = {
        invoice_no: Date.now(),
        date: new Date().toISOString().split("T")[0],
        customer: {
            name: "Walk-in Customer",
            address1: "",
            address2: ""
        },
        items: BILL_ITEMS.map(i => ({
            itemID: i.itemID,          // used by backend stock reduction
            description: i.name,       // used by invoice
            qty: i.qty,
            price: i.price             
        })),
        subtotal,
        tax_amount: 0,
        grand_total: subtotal
        };


      try {
        const res = await fetch("/invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Billing failed");
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url);

        // Reset bill
        BILL_ITEMS = [];
        renderBill();
      } catch (err) {
        console.error(err);
        alert("Something went wrong while generating bill");
      }
    });

    log("Generate bill listener attached", "attach");
  }

  const scanBtn = document.querySelector(".billing-scan-btn");

  if (scanBtn) {
    scanBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:5000/run-scanner");
        const data = await res.json();

        if (!data.barcode) {
          alert("No barcode scanned");
          return;
        }

        const item = STOCK_ITEMS.find((i) => i.barcode === data.barcode);

        if (!item) {
          alert("Scanned item not found in stock");
          return;
        }

        addToBill(item);
      } catch (err) {
        console.error(err);
        alert("Scanner failed");
      }
    });
  }

  log("attachBillingListeners() end", "end");
}

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("qty-btn")) return;

  const id = Number(e.target.dataset.id);
  const item = BILL_ITEMS.find((i) => i.itemID === id);
  if (!item) return;

  if (e.target.classList.contains("plus")) {
    if (item.qty < getAvailableStock(id)) {
      item.qty += 1;
    }
  }

  if (e.target.classList.contains("minus")) {
    item.qty -= 1;
    if (item.qty <= 0) {
      BILL_ITEMS = BILL_ITEMS.filter((i) => i.itemID !== id);
    }
  }

  renderBill();
});

function getAvailableStock(itemID) {
  const stockItem = STOCK_ITEMS.find((i) => i.itemID === itemID);
  return stockItem ? stockItem.inStock : 0;
}

// -------------------- INIT --------------------
attachBillingListeners();

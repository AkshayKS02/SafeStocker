document.addEventListener("DOMContentLoaded", function () {
  /* -------------------- VIEW + NAV -------------------- */
  const allViews = [
    document.getElementById("home-view"),
    document.getElementById("track-view"),
    document.getElementById("billing-view"),
    document.getElementById("entry-view"),
    document.getElementById("stock-view"), // Added Stock View
  ];

  const homeButton = document.getElementById("home-button");
  const trackButton = document.getElementById("track-button");
  const billingButton = document.getElementById("billing-button");
  const addNewButton = document.getElementById("add-new-button");
  const addStockButton = document.getElementById("add-stock-button"); // New Button
  const getStartedButton = document.getElementById("get-started-button");
  const allNavButtons = document.querySelectorAll(".nav-button");

  function switchAppView(viewToShow, buttonToActivate) {
    allViews.forEach((v) => { if(v) v.style.display = "none"; });
    if(viewToShow) viewToShow.style.display = "block";
    allNavButtons.forEach((b) => b.classList.remove("active-nav-button"));
    if(buttonToActivate) buttonToActivate.classList.add("active-nav-button");
  }

  homeButton.addEventListener("click", () => switchAppView(allViews[0], homeButton));
  trackButton.addEventListener("click", () => switchAppView(allViews[1], trackButton));
  billingButton.addEventListener("click", () => switchAppView(allViews[2], billingButton));
  addNewButton.addEventListener("click", () => switchAppView(allViews[3], addNewButton));

  // --- NEW: Add Stock Button Listener ---
  if (addStockButton) {
    addStockButton.addEventListener("click", () => {
        switchAppView(allViews[4], addStockButton);
        // Refresh the dropdown when clicking the button
        fetchItemsFromApi(); 
    });
  }

  if (getStartedButton) {
    getStartedButton.addEventListener("click", () => {
      document.getElementById("login-modal").style.display = "flex";
    });
  }

  // --- LEARN MORE SCROLL LOGIC ---
  document.addEventListener("click", function (e) {
    const btn = e.target.closest && e.target.closest("#learn-more-button");
    if (!btn) return;
    e.preventDefault();

    try {
      switchAppView(allViews[0], homeButton);
    } catch (err) {}

    setTimeout(() => {
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
          const yCoordinate = aboutSection.getBoundingClientRect().top + window.scrollY - 75;
          window.scrollTo({ top: yCoordinate, behavior: 'smooth' });
      }
    }, 300); 
  });

  switchAppView(allViews[0], homeButton);

  /* -------------------- LOGIN -------------------- */
  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

  if(userButton && loginModal) {
    userButton.addEventListener("click", () => (loginModal.style.display = "flex"));
    closeModalButton.addEventListener("click", () => (loginModal.style.display = "none"));
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            userButton.textContent = `Hi, ${username}`;
            loginModal.style.display = "none";
            loginForm.reset();
        }
    });
  }

  /* -------------------- FORM TOGGLE SYSTEM -------------------- */
  const standardToggle = document.getElementById("standard-toggle");
  const customToggle = document.getElementById("custom-toggle");
  const formStandard = document.getElementById("form-standard");
  const formCustom = document.getElementById("form-custom");

  function switchFormToggle(showForm, activeToggle, inactiveToggle) {
    if(!formStandard || !formCustom) return;
    formStandard.style.display = "none";
    formCustom.style.display = "none";
    showForm.style.display = "block";
    activeToggle.classList.add("active-toggle");
    inactiveToggle.classList.remove("active-toggle");
    const preview = document.getElementById("scan-preview-standard");
    if(preview) preview.style.display = "none";
  }

  if(standardToggle && customToggle) {
    standardToggle.onclick = () => switchFormToggle(formStandard, standardToggle, customToggle);
    customToggle.onclick = () => switchFormToggle(formCustom, customToggle, standardToggle);
    switchFormToggle(formStandard, standardToggle, customToggle);
  }

  /* -------------------- ADD NEW -> SCAN BUTTON -------------------- */
  if(addNewButton) {
      addNewButton.addEventListener("click", () => {
        const scanBtn = document.getElementById("scan-btn");
        if(!scanBtn) return;

        scanBtn.onclick = () => {
        fetch("http://localhost:5000/run-scanner")
            .then((res) => res.json())
            .then((data) => {
            const barcode = data.barcode;
            return fetch(`http://localhost:5000/barcode/details/${barcode}`)
                .then((r) => r.json())
                .then((productData) => ({ productData, barcode }));
            })
            .then(({ productData, barcode }) => {
            
            const preview = document.getElementById("scan-preview-standard");
            const nameField = document.getElementById("scan-name-standard");
            const codeField = document.getElementById("scan-barcode-standard");
            
            if(preview) {
                preview.style.display = "flex";
                nameField.innerText = productData.product.name;
                codeField.innerText = barcode;
            }

            window.scannedItem = {
                barcode,
                name: productData.product.name,
                brand: productData.product.brand,
                package_quantity: productData.product.package_quantity,
            };
            })
            .catch((err) => console.error("Scan error:", err));
        };
      });
  }

  /* -------------------- CARD SYSTEM & STOCK DROPDOWN -------------------- */
  const ITEMS_API = "http://localhost:5000/items";
  let ALL_ITEMS = [];

  const parseDate = (d) => (d ? new Date(d) : null);

  function computeStatus(item) {
    const exp = parseDate(item.expiry_date || item.expiryDate);
    if (!exp) return { key: "unknown", label: "Unknown", dot: "" };

    const days = (exp - new Date()) / (1000 * 60 * 60 * 24);
    if (days < 0) return { key: "expired", label: "Expired", dot: "red" };
    if (days <= 7) return { key: "near", label: "Near Expiry", dot: "yellow" };
    return { key: "fresh", label: "Fresh", dot: "darkgreen" };
  }

  function renderCard(item) {
    const status = computeStatus(item);
    return `
      <div class="item-card" data-id="${item.id}">
        <div class="card-top">
          <div>
            <div class="item-title">${item.name || "Unnamed"}</div>
            <div class="item-meta small-muted">
              <span class="barcode">${item.barcode || ""}</span>
            </div>
          </div>
          <div class="qty-box">Qty: ${item.quantity || "-"}</div>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <div class="status">
            <span class="status-dot ${status.dot}"></span> ${status.label}
          </div>
        </div>
      </div>
    `;
  }

  function renderItems() {
    const container = document.getElementById("items-container");
    if(container) container.innerHTML = ALL_ITEMS.map(renderCard).join("");
  }

  /* --- NEW: Populate Stock Dropdown --- */
  const stockItemSelect = document.getElementById("stock-item-select");
  
  function populateStockItemDropdown() {
    if(!stockItemSelect) return;
    stockItemSelect.innerHTML = '<option value="">-- Choose an item --</option>';
    if (ALL_ITEMS && ALL_ITEMS.length > 0) {
      ALL_ITEMS.forEach((item) => {
        const option = document.createElement("option");
        // Adjust these keys based on your exact database columns
        option.value = item.ItemID || item.id; 
        option.textContent = (item.ItemName || item.name) + " (" + (item.barcode || "") + ")";
        stockItemSelect.appendChild(option);
      });
    }
  }

  async function fetchItemsFromApi() {
    try {
      const res = await fetch(ITEMS_API);
      ALL_ITEMS = await res.json();
      renderItems();
      populateStockItemDropdown(); // Update the dropdown whenever items load
    } catch (err) {
      console.error("Failed to load items (API might be offline)", err);
    }
  }

  fetchItemsFromApi();

  /* -------------------- ADD STOCK FORM SUBMIT -------------------- */
  const stockForm = document.getElementById("stock-form");

  if (stockForm) {
    stockForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const itemID = stockItemSelect.value;
      const quantity = document.getElementById("stock-quantity").value.trim();
      const mfgDate = document.getElementById("stock-manufacture-date").value.trim();
      const expDate = document.getElementById("stock-expiry-date").value.trim();

      if (!itemID) {
        alert("Please select an item.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/items/update-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ItemID: itemID,
            quantity: parseInt(quantity),
            manufacture_date: mfgDate,
            expiry_date: expDate
          }),
        });

        const data = await res.json();

        if (data.success || res.ok) {
          alert("Stock added successfully!");
          fetchItemsFromApi(); // Refresh list
          stockForm.reset();
        } else {
          alert("Failed to add stock: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Stock add error:", err);
        alert("Error adding stock. Check backend console.");
      }
    });
  }

  /* -------------------- TRACK VIEW FILTER PILLS -------------------- */
  const filterPills = document.querySelectorAll(".filter-pill");
  const currentSort = { key: null, dir: 1 };

  function renderItemsWithList(list) {
    const container = document.getElementById("items-container");
    if(container) container.innerHTML = list.map(renderCard).join("");
  }

  if (filterPills && filterPills.length) {
    filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const key = pill.textContent.trim().toLowerCase();
        filterPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        if (currentSort.key === key) {
          currentSort.dir = -currentSort.dir;
        } else {
          currentSort.key = key;
          currentSort.dir = 1;
        }

        const list = [...ALL_ITEMS];
        if (key === "name") {
          list.sort((a, b) => {
            const an = (a.name || "").toString();
            const bn = (b.name || "").toString();
            return an.localeCompare(bn) * currentSort.dir;
          });
        } else if (key === "quantity") {
          list.sort((a, b) => {
            const aq = Number(a.quantity) || 0;
            const bq = Number(b.quantity) || 0;
            return (aq - bq) * currentSort.dir;
          });
        }
        renderItemsWithList(list);
      });
    });
  }

  /* -------------------- BACKGROUND BARCODE POLLING -------------------- */
  function handleScannedProduct(data) {
    const p = data.product;
    const code = String(p.barcode || "").trim();
    if (!code) return;

    window.scannedItem = {
      barcode: code,
      name: p.name || "Scanned Item",
      quantity: p.quantity || "",
      manufacture_date: p.manufacture_date || "",
      expiry_date: p.expiry_date || "",
    };

    const entryView = document.getElementById("entry-view");
    if (entryView && entryView.style.display === "block") {
      const preview = document.getElementById("scan-preview-standard");
      if(preview) {
        preview.style.display = "flex";
        document.getElementById("scan-name-standard").innerText = window.scannedItem.name;
        document.getElementById("scan-barcode-standard").innerText = window.scannedItem.barcode;
      }
    }
  }

  setInterval(async () => {
    const entryView = document.getElementById("entry-view");
    if (entryView && entryView.style.display === "block") return;

    try {
      const res = await fetch("http://localhost:5000/barcode/latest");
      const data = await res.json();
      if (data.product) handleScannedProduct(data);
    } catch (err) {}
  }, 1500);

  /* -------------------- SAVE ITEM (Standard Form) -------------------- */
  const standardForm = document.getElementById("form-standard");

  if(standardForm) {
    standardForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const quantity = document.getElementById("quantity").value.trim();
        const mfg = document.getElementById("manufacture-date").value.trim();
        const exp = document.getElementById("expiry-date").value.trim();
        const scanned = window.scannedItem || {};

        if (!scanned.barcode) {
          return alert("Please scan a barcode before saving.");
        }

        const newItem = {
          barcode: scanned.barcode,
          name: scanned.name || "Unnamed Product",
          quantity,
          manufacture_date: mfg,
          expiry_date: exp,
        };

        try {
        const res = await fetch("http://localhost:5000/items/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
        });
        const data = await res.json();
        if (data.success) {
            alert("Item saved successfully!");
            fetchItemsFromApi();
            standardForm.reset();
            const preview = document.getElementById("scan-preview-standard");
            if(preview) preview.style.display = "none";
            window.scannedItem = null;
        }
        } catch (err) {
          console.error("Save error:", err);
          alert("Failed to save item.");
        }
    });
  }

  /* -------------------- BILLING SYSTEM -------------------- */
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-bill-btn")) {
      const name = e.target.dataset.name;
      const price = parseInt(e.target.dataset.price);

      const container = document.getElementById("bill-items");
      const totalBox = document.getElementById("bill-total");

      if(container && totalBox) {
        container.innerHTML += `
            <div class="bill-line" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${name}</span>
                <span>₹${price}</span>
            </div>`;
        const current = parseInt(totalBox.innerText.replace("₹", "")) || 0;
        totalBox.innerText = "₹" + (current + price);
      }
    }
  });
});
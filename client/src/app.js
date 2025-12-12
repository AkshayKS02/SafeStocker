import { 
  checkGoogleLogin, 
  manualLogin, 
  logoutUser 
} from "./auth.js";

import { STOCK_ITEMS, loadStock } from "./stock.js";

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
    allViews.forEach((v) => {
      if (v) v.style.display = "none";
    });
    if (viewToShow) viewToShow.style.display = "block";
    allNavButtons.forEach((b) => b.classList.remove("active-nav-button"));
    if (buttonToActivate) buttonToActivate.classList.add("active-nav-button");
  }

  homeButton.addEventListener("click", () =>
    switchAppView(allViews[0], homeButton)
  );
  trackButton.addEventListener("click", async () => {
    switchAppView(allViews[1], trackButton);
    await loadStock();
    renderTrackCards();
  });
  billingButton.addEventListener("click", async () => {
    switchAppView(allViews[2], billingButton);
    await loadStock();
    renderBillingProducts(STOCK_ITEMS);
  });

  addNewButton.addEventListener("click", () =>
    switchAppView(allViews[3], addNewButton)
  );

  // --- NEW: Add Stock Button Listener ---
  if (addStockButton) {
    addStockButton.addEventListener("click", () => {
      switchAppView(allViews[4], addStockButton);
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
        const yCoordinate =
          aboutSection.getBoundingClientRect().top + window.scrollY - 75;
        window.scrollTo({ top: yCoordinate, behavior: "smooth" });
      }
    }, 300);
  });

  switchAppView(allViews[0], homeButton);

  /* -------------------- LOGIN (MANUAL + GOOGLE SUPPORT) -------------------- */

  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

  /* Named function so Google login can REMOVE it */
  function openLoginModal() {
    loginModal.style.display = "flex";
  }

  if (userButton && loginModal) {
    // Manual login – open modal
    userButton.onclick = openLoginModal;

    // Close modal
    closeModalButton.addEventListener("click", () => {
      loginModal.style.display = "none";
    });

    // Manual login submit
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = usernameInput.value.trim();
      if (!phone) return;
      manualLogin(phone, "Owner");

      loginModal.style.display = "none";
      loginForm.reset();
    });
  }

  /* -------------------- FORM TOGGLE SYSTEM -------------------- */
  const standardToggle = document.getElementById("standard-toggle");
  const customToggle = document.getElementById("custom-toggle");
  const formStandard = document.getElementById("form-standard");
  const formCustom = document.getElementById("form-custom");

  function switchFormToggle(showForm, activeToggle, inactiveToggle) {
    if (!formStandard || !formCustom) return;
    formStandard.style.display = "none";
    formCustom.style.display = "none";
    showForm.style.display = "block";
    activeToggle.classList.add("active-toggle");
    inactiveToggle.classList.remove("active-toggle");
    const preview = document.getElementById("scan-preview-standard");
    if (preview) preview.style.display = "none";
  }

  if (standardToggle && customToggle) {
    standardToggle.onclick = () =>
      switchFormToggle(formStandard, standardToggle, customToggle);
    customToggle.onclick = () =>
      switchFormToggle(formCustom, customToggle, standardToggle);
    switchFormToggle(formStandard, standardToggle, customToggle);
  }

  /* -------------------- ADD NEW -> SCAN BUTTON -------------------- */
  if (addNewButton) {
    addNewButton.addEventListener("click", () => {
      const scanBtn = document.getElementById("scan-btn");
      if (!scanBtn) return;

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

            if (preview) {
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

  function renderTrackCards() {
    const container = document.getElementById("items-container");
    if (!container) return;

    if (STOCK_ITEMS.length === 0) {
      container.innerHTML = "<p>No stock found.</p>";
      return;
    }

    container.innerHTML = STOCK_ITEMS.map(
      (item) => `
    <div class="item-card ${item.color}">
      <div class="item-title">${item.name}</div>
      <div class="item-meta">Barcode: ${item.barcode}</div>
      <div class="qty-box">In Stock: ${item.inStock}</div>
      <div class="expiry">Expiry: ${item.expiry}</div>
      <div class="days-left">Days Left: ${item.daysLeft}</div>
    </div>
  `
    ).join("");
  }

  function populateStockItemDropdown() {
    const stockItemSelect = document.getElementById("stock-item-select");
    if (!stockItemSelect) return;

    stockItemSelect.innerHTML = `<option value="">-- Choose an item --</option>`;

    STOCK_ITEMS.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.itemID;
      opt.textContent = `${item.name} (${item.barcode})`;
      stockItemSelect.appendChild(opt);
    });
  }

  /* -------------------- TRACK VIEW FILTER PILLS -------------------- */
  document.getElementById("sort-name").onclick = () => {
    STOCK_ITEMS.sort((a, b) => a.name.localeCompare(b.name));
    renderTrackCards();
  };
  document.getElementById("sort-qty").onclick = () => {
    STOCK_ITEMS.sort((a, b) => a.inStock - b.inStock);
    renderTrackCards();
  };
  document.getElementById("sort-date").onclick = () => {
    STOCK_ITEMS.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    renderTrackCards();
  };


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
      if (preview) {
        preview.style.display = "flex";
        document.getElementById("scan-name-standard").innerText =
          window.scannedItem.name;
        document.getElementById("scan-barcode-standard").innerText =
          window.scannedItem.barcode;
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

  if (standardForm) {
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
          await loadStock();
          populateStockItemDropdown();
          standardForm.reset();
          const preview = document.getElementById("scan-preview-standard");
          if (preview) preview.style.display = "none";
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

      if (container && totalBox) {
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

  function renderBillingProducts(list) {
    const box = document.querySelector(".billing-products-box");

    box.innerHTML =
      "<h3>Products</h3>" +
      list
        .map(
          (item) => `
      <div class="billing-product-card">
        <div>
          <div class="bill-item-name">${item.name}</div>
          <div class="bill-item-barcode">${item.barcode}</div>
        </div>
        <button class="add-bill-btn" data-name="${item.name}" data-price="0">Add</button>
      </div>
    `
        )
        .join("");
  }

  const billingSearch = document.getElementById("billing-search");

  billingSearch.addEventListener("input", () => {
    const q = billingSearch.value.toLowerCase();
    const filtered = STOCK_ITEMS.filter(
      (i) => i.name.toLowerCase().includes(q) || i.barcode.includes(q)
    );
    renderBillingProducts(filtered);
  });


  /* -------------------- HERO CAROUSEL -------------------- */
  const slides = document.querySelectorAll(".hero-image");
  if (slides.length > 1) {
    let currentSlide = 0;

    setInterval(() => {
      // 1. Hide current slide
      slides[currentSlide].classList.remove("active");

      // 2. Calculate next slide index
      currentSlide = (currentSlide + 1) % slides.length;

      // 3. Show next slide
      slides[currentSlide].classList.add("active");
    }, 5000); // Change image every 5000ms (5 seconds)
  }

  checkGoogleLogin();
});

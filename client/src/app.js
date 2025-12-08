document.addEventListener("DOMContentLoaded", function () {
  /* -------------------- VIEW + NAV -------------------- */
  const allViews = [
    document.getElementById("home-view"),
    document.getElementById("track-view"),
    document.getElementById("billing-view"),
    document.getElementById("entry-view"),
  ];

  const homeButton = document.getElementById("home-button");
  const trackButton = document.getElementById("track-button");
  const billingButton = document.getElementById("billing-button");
  const addNewButton = document.getElementById("add-new-button");
  const getStartedButton = document.getElementById("get-started-button");
  const learnMoreButton = document.getElementById("learn-more-button");
  const allNavButtons = document.querySelectorAll(".nav-button");

  function switchAppView(viewToShow, buttonToActivate) {
    allViews.forEach((v) => (v.style.display = "none"));
    viewToShow.style.display = "block";
    allNavButtons.forEach((b) => b.classList.remove("active-nav-button"));
    buttonToActivate.classList.add("active-nav-button");
    // Hide the Learn More info and restore hero when switching away from home
    const infoEl = document.getElementById("learn-more-section") || document.getElementById("learn-more-info");
    const hero = document.querySelector(".hero-section");
    if (infoEl && viewToShow && viewToShow.id !== "home-view") {
      infoEl.classList.remove("visible");
      // hide after transition (keep timing similar to CSS transition)
      setTimeout(() => (infoEl.style.display = "none"), 300);
    }
    if (hero && viewToShow && viewToShow.id !== "home-view") {
      hero.classList.remove("compact");
    }
  }

  homeButton.addEventListener("click", () =>
    switchAppView(allViews[0], homeButton)
  );
  trackButton.addEventListener("click", () =>
    switchAppView(allViews[1], trackButton)
  );
  billingButton.addEventListener("click", () =>
    switchAppView(allViews[2], billingButton)
  );
  addNewButton.addEventListener("click", () =>
    switchAppView(allViews[3], addNewButton)
  );

  if (getStartedButton) {
    getStartedButton.addEventListener("click", () =>
      switchAppView(allViews[3], addNewButton)
    );
  }

  // Learn More -> reveal info on the home page and scroll to it
  if (learnMoreButton) {
    learnMoreButton.addEventListener("click", () => {
      // ensure home view is visible
      switchAppView(allViews[0], homeButton);

      const infoEl = document.getElementById("learn-more-section");
      if (!infoEl) return;

      // show with fade-in then scroll smoothly
      infoEl.style.display = "block";
      // reduce hero height so the info sits closer to the buttons
      const hero = document.querySelector(".hero-section");
      if (hero) hero.classList.add("compact");
      // allow layout to update then add visible class for transition
      setTimeout(() => infoEl.classList.add("visible"), 20);

      // small timeout to allow visible class to apply before scrolling
      setTimeout(() => {
        infoEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    });
  }

  // Hide learn-more info when returning to home via nav button
  homeButton.addEventListener("click", () => {
    const infoEl = document.getElementById("learn-more-section");
    if (infoEl) {
      infoEl.classList.remove("visible");
      // hide after transition
      setTimeout(() => (infoEl.style.display = "none"), 300);
    }
    // remove compact hero mode when returning to normal home
    const hero = document.querySelector(".hero-section");
    if (hero) hero.classList.remove("compact");
  });

  switchAppView(allViews[0], homeButton);

  /* -------------------- LOGIN -------------------- */
  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

  userButton.addEventListener(
    "click",
    () => (loginModal.style.display = "flex")
  );
  closeModalButton.addEventListener(
    "click",
    () => (loginModal.style.display = "none")
  );

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
      userButton.textContent = `Hi, ${username}`;
      loginModal.style.display = "none";
      loginForm.reset();
    }
  });

  /* -------------------- FORM TOGGLE SYSTEM -------------------- */
  const standardToggle = document.getElementById("standard-toggle");
  const customToggle = document.getElementById("custom-toggle");
  const formStandard = document.getElementById("form-standard");
  const formCustom = document.getElementById("form-custom");

  function switchFormToggle(showForm, activeToggle, inactiveToggle) {
    formStandard.style.display = "none";
    formCustom.style.display = "none";
    showForm.style.display = "block";

    activeToggle.classList.add("active-toggle");
    inactiveToggle.classList.remove("active-toggle");

    // Hide preview when switching forms
    document.getElementById("scan-preview-standard").style.display = "none"; // FIXED
  }

  standardToggle.onclick = () =>
    switchFormToggle(formStandard, standardToggle, customToggle);

  customToggle.onclick = () =>
    switchFormToggle(formCustom, customToggle, standardToggle);

  /* -------------------- ADD NEW -> SCAN BUTTON -------------------- */
  addNewButton.addEventListener("click", () => {
    const scanBtn = document.getElementById("scan-btn");

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
          // ⭐ FIXED: Show preview in STANDARD ONLY
          document.getElementById("scan-preview-standard").style.display =
            "flex";
          document.getElementById("scan-name-standard").innerText =
            productData.product.name;
          document.getElementById("scan-barcode-standard").innerText = barcode;

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

  /* -------------------- CARD SYSTEM -------------------- */
  const ITEMS_API = "http://localhost:5000/items";
  let ALL_ITEMS = [];

  const parseDate = (d) => (d ? new Date(d) : null);
  const formatDate = (d) =>
    parseDate(d) ? new Date(d).toLocaleDateString() : "-";

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
    container.innerHTML = ALL_ITEMS.map(renderCard).join("");
  }

  async function fetchItemsFromApi() {
    try {
      const res = await fetch(ITEMS_API);
      ALL_ITEMS = await res.json();
      renderItems();
    } catch (err) {
      console.error("Failed to load items", err);
    }
  }

  fetchItemsFromApi();

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

    if (document.getElementById("entry-view").style.display === "block") {
      document.getElementById("scan-preview-standard").style.display = "flex"; // FIXED
      document.getElementById("scan-name-standard").innerText =
        window.scannedItem.name;
      document.getElementById("scan-barcode-standard").innerText =
        window.scannedItem.barcode;
    }
  }

  setInterval(async () => {
    if (document.getElementById("entry-view").style.display === "block") return;

    try {
      const res = await fetch("http://localhost:5000/barcode/latest");
      const data = await res.json();
      if (data.product) handleScannedProduct(data);
    } catch (err) {
      console.error("[scan error]", err);
    }
  }, 1500);

  /* -------------------- SAVE ITEM -------------------- */
  const standardForm = document.getElementById("form-standard");

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

        // hide new preview correctly
        document.getElementById("scan-preview-standard").style.display = "none"; // FIXED
        window.scannedItem = null;
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save item.");
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-bill-btn")) {
      const name = e.target.dataset.name;
      const price = parseInt(e.target.dataset.price);

      const container = document.getElementById("bill-items");
      const totalBox = document.getElementById("bill-total");

      container.innerHTML += `
            <div class="bill-line">
                <span>${name}</span>
                <span>₹${price}</span>
            </div>
        `;

      const current = parseInt(totalBox.innerText.replace("₹", ""));
      totalBox.innerText = "₹" + (current + price);
    }
  });
});

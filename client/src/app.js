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
  const allNavButtons = document.querySelectorAll(".nav-button");

  function switchAppView(viewToShow, buttonToActivate) {
    allViews.forEach((v) => (v.style.display = "none"));
    viewToShow.style.display = "block";
    allNavButtons.forEach((b) => b.classList.remove("active-nav-button"));
    buttonToActivate.classList.add("active-nav-button");
  }

  homeButton.addEventListener("click", () => switchAppView(allViews[0], homeButton));
  trackButton.addEventListener("click", () => switchAppView(allViews[1], trackButton));
  billingButton.addEventListener("click", () => switchAppView(allViews[2], billingButton));
  addNewButton.addEventListener("click", () => switchAppView(allViews[3], addNewButton));

  switchAppView(allViews[0], homeButton);

  /* -------------------- LOGIN -------------------- */
  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

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

  /* -------------------- ADD NEW -> SCAN BUTTON -------------------- */
  addNewButton.addEventListener("click", () => {
    const scanBtn = document.getElementById("scan-btn");
    scanBtn.onclick = () => {
      fetch("http://localhost:5000/run-scanner")
        .then((res) => res.text())
        .then(console.log)
        .catch(console.error);
    };
  });

  /* -------------------- CARD SYSTEM -------------------- */
  const ITEMS_API = "/items";
  let ALL_ITEMS = [];

  const parseDate = (d) => (d ? new Date(d) : null);
  const formatDate = (d) => (parseDate(d) ? new Date(d).toLocaleDateString() : "-");

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
            <div class="item-meta small-muted">${item.location || ""} • <span class="barcode">${item.barcode || ""}</span></div>
          </div>
          <div class="qty-box">Qty: ${item.quantity || "-"}</div>
        </div>

        <div style="display:flex; justify-content:space-between;">
          <div class="status"><span class="status-dot ${status.dot}"></span> ${status.label}</div>

          <div class="manuf-exp">
            <div class="label">Mfg</div>
            <div class="value">${formatDate(item.manufacture_date)}</div>
            <div class="label" style="margin-top:6px;">Exp</div>
            <div class="value">${formatDate(item.expiry_date)}</div>
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

  /* -------------------- BARCODE POLLING (short comments) -------------------- */
  let LAST_SCANNED = null;

  function handleScannedProduct(data) {
    const p = data.product;
    const code = String(p.barcode || "").trim();
    if (!code || code === LAST_SCANNED) return;

    LAST_SCANNED = code;
    console.log("[scan]", p);

    const newItem = {
      id: "scan-" + Date.now(),
      barcode: code,
      name: p.name || "Scanned Item",
      quantity: p.quantity || "",
      manufacture_date: p.manufacture_date || "",
      expiry_date: p.expiry_date || ""
    };

    ALL_ITEMS.unshift(newItem);
    renderItems();
  }

  setInterval(async () => {
    try {
      const res = await fetch("http://localhost:5000/barcode/latest");
      const data = await res.json();
      if (data.product) handleScannedProduct(data);
    } catch (err) {
      console.error("[scan error]", err);
    }
  }, 1500);

});

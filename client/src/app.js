document.addEventListener("DOMContentLoaded", function () {
  const allViews = [
    document.getElementById("home-view"),
    document.getElementById("track-view"),
    document.getElementById("billing-view"),
    document.getElementById("entry-view"),
  ];

  const allNavButtons = document.querySelectorAll(".nav-button");
  const homeButton = document.getElementById("home-button");
  const trackButton = document.getElementById("track-button");
  const billingButton = document.getElementById("billing-button");
  const addNewButton = document.getElementById("add-new-button");

  const standardToggle = document.getElementById("standard-toggle");
  const customToggle = document.getElementById("custom-toggle");
  const formStandard = document.getElementById("form-standard");
  const formCustom = document.getElementById("form-custom");

  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

  function switchAppView(viewToShow, buttonToActivate) {
    allViews.forEach((view) => (view.style.display = "none"));
    viewToShow.style.display = "block";
    allNavButtons.forEach((btn) => btn.classList.remove("active-nav-button"));
    buttonToActivate.classList.add("active-nav-button");
  }

  homeButton.addEventListener("click", () => switchAppView(allViews[0], homeButton));
  trackButton.addEventListener("click", () => switchAppView(allViews[1], trackButton));
  billingButton.addEventListener("click", () => switchAppView(allViews[2], billingButton));
  addNewButton.addEventListener("click", () => switchAppView(allViews[3], addNewButton));

  switchAppView(allViews[0], homeButton);

  function switchFormToggle(formToShow, toggleToActivate, toggleToDeactivate) {
    formStandard.style.display = "none";
    formCustom.style.display = "none";
    formToShow.style.display = "block";
    toggleToActivate.classList.add("active-toggle");
    toggleToDeactivate.classList.remove("active-toggle");
  }

  if (standardToggle && customToggle) {
    standardToggle.addEventListener("click", () =>
      switchFormToggle(formStandard, standardToggle, customToggle)
    );
    customToggle.addEventListener("click", () =>
      switchFormToggle(formCustom, customToggle, standardToggle)
    );
  }

  userButton.addEventListener("click", () => (loginModal.style.display = "flex"));
  closeModalButton.addEventListener("click", () => (loginModal.style.display = "none"));

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = usernameInput.value;
    if (username.trim() !== "") {
      userButton.textContent = `Hi, ${username}`;
      loginModal.style.display = "none";
      loginForm.reset();
    }
  });

  const filterButtons = document.querySelectorAll(".filter-pill");
  const productTable = document.querySelector(".product-table tbody");

  if (filterButtons && productTable) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rows = Array.from(productTable.querySelectorAll("tr"));
        const column = button.textContent.trim().toLowerCase();

        rows.sort((a, b) => {
          let A, B;
          if (column === "date") {
            A = new Date(a.cells[2].textContent.split("/").reverse().join("-"));
            B = new Date(b.cells[2].textContent.split("/").reverse().join("-"));
            return A - B;
          } else if (column === "quantity") {
            A = a.cells[1].textContent.toLowerCase();
            B = b.cells[1].textContent.toLowerCase();
            return A.localeCompare(B);
          } else {
            A = a.cells[0].textContent.toLowerCase();
            B = b.cells[0].textContent.toLowerCase();
            return A.localeCompare(B);
          }
        });

        rows.forEach((row) => productTable.appendChild(row));
        filterButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  addNewButton.addEventListener("click", () => {
    switchAppView(allViews[3], addNewButton);
    const scanBtn = document.getElementById("scan-btn");
    scanBtn.addEventListener("click", () => {
      fetch("http://localhost:5000/run-scanner")
        .then((res) => res.text())
        .then(console.log)
        .catch(console.error);
    });
  });

  setInterval(() => {
    fetch("http://localhost:5000/barcode/latest")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.product) return;
        console.log("New Product:", data.product);
      });
  }, 1500);
    /* ---------- Card system: fetch items, compute status, render cards, search/filter ---------- */
  const ITEMS_API = "/items"; // change to full origin if needed, e.g. http://localhost:5000/items

  let ALL_ITEMS = [];

  function parseDate(d) {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt) ? null : dt;
  }
  function formatDateStr(d) {
    const dt = parseDate(d);
    return dt ? dt.toLocaleDateString() : (d || '-');
  }

  function computeStatus(item) {
    const expiryRaw = item.expiryDate || item.expiry_date || item.expDate || item.expiry;
    const expiry = parseDate(expiryRaw);
    if (!expiry) return { key: "unknown", label: "Unknown", dot: "" };
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000*60*60*24));
    if (diffDays < 0) return { key: "expired", label: "Expired", dot: "red" };
    if (diffDays <= 7) return { key: "near", label: "Near Expiry", dot: "yellow" };
    return { key: "fresh", label: "Fresh", dot: "darkgreen" };
  }

  function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function jsonSafe(v) { return v === undefined || v === null ? "''" : JSON.stringify(v); }

  function renderCard(item) {
    const status = computeStatus(item);
    const manuf = formatDateStr(item.manufacturerDate || item.manufacture_date || item.mfgDate || item.mfg);
    const expiry = formatDateStr(item.expiryDate || item.expiry_date || item.expDate || item.expiry);
    const qty = item.quantity ?? item.qty ?? '—';
    const location = item.location || item.place || '';
    const barcode = item.barcode || item.code || '';

    return `
      <div class="item-card" data-id="${item.id ?? ''}" data-name="${escapeHtml((item.name||'').toLowerCase())}" data-barcode="${escapeHtml(String(barcode).toLowerCase())}" data-status="${status.key}">
        <div class="card-top">
          <div>
            <div class="item-title">${escapeHtml(item.name || item.title || 'Unnamed')}</div>
            <div class="item-meta small-muted">${escapeHtml(location)} • <span class="barcode">${escapeHtml(barcode)}</span></div>
          </div>
          <div class="qty-box">Qty: ${escapeHtml(String(qty))}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div class="item-meta">
            <div class="status"><span class="status-dot ${status.dot}"></span> ${status.label}</div>
          </div>

          <div class="manuf-exp">
            <div class="label">Mfg</div>
            <div class="value">${escapeHtml(manuf)}</div>

            <div class="label" style="margin-top:6px;">Exp</div>
            <div class="value">${escapeHtml(expiry)}</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="card-button" onclick="viewItem(${jsonSafe(item.id)})">View</button>
          <button class="card-button primary" onclick="openEdit(${jsonSafe(item.id)})">Edit</button>
        </div>
      </div>
    `;
  }

  function renderItemsToDom(items) {
    const container = document.getElementById("items-container");
    if (!container) return;
    container.innerHTML = Array.isArray(items) ? items.map(renderCard).join('') : renderCard(items);
  }

  async function fetchItemsFromApi() {
    try {
      const res = await fetch(ITEMS_API);
      if (!res.ok) throw new Error('Network response not ok: ' + res.status);
      const data = await res.json();
      ALL_ITEMS = Array.isArray(data) ? data : [data];
      applyFiltersAndRender();
    } catch (err) {
      console.error('Failed to load items', err);
      const container = document.getElementById("items-container");
      if (container) container.innerHTML = '<div class="small-muted">Could not load items. Check server/CORS.</div>';
    }
  }

  function applyFiltersAndRender() {
    const q = (document.getElementById("search-input")?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById("status-filter")?.value || 'all';
    const dateVal = document.getElementById("date-filter")?.value; // yyyy-mm-dd

    const filtered = ALL_ITEMS.filter(it => {
      if (q) {
        const hay = ((it.name||'') + ' ' + (it.barcode||'') + ' ' + (it.title||'')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const status = computeStatus(it).key;
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (dateVal) {
        const d = parseDate(it.expiryDate || it.expiry_date || it.expDate || it.expiry);
        if (!d) return false;
        if (d.toISOString().slice(0,10) !== dateVal) return false;
      }
      return true;
    });

    renderItemsToDom(filtered);
  }

  /* placeholder handlers — hook into your detail/edit UI */
  function viewItem(id) { console.log('view', id); /* open modal or navigate */ }
  function openEdit(id) { console.log('edit', id); /* open edit UI */ }

  /* wire up controls */
  document.addEventListener('DOMContentLoaded', () => {
    // fetch items immediately on load
    fetchItemsFromApi();

    const s = document.getElementById('search-input');
    if (s) s.addEventListener('input', applyFiltersAndRender);

    const sf = document.getElementById('status-filter');
    if (sf) sf.addEventListener('change', applyFiltersAndRender);

    const df = document.getElementById('date-filter');
    if (df) df.addEventListener('change', applyFiltersAndRender);

    const refresh = document.getElementById('refresh-items');
    if (refresh) refresh.addEventListener('click', fetchItemsFromApi);
  });

});


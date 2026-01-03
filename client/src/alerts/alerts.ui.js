
export function renderAlerts(alerts) {
  const dropdown = document.getElementById("alert-dropdown");
  const dot = document.getElementById("alert-dot");

  if (!dropdown || !dot) return;

  if (alerts.length === 0) {
    dropdown.innerHTML = `<p style="padding:10px;">No alerts 🎉</p>`;
    dot.classList.add("hidden");
    return;
  }

  dot.classList.remove("hidden");

  dropdown.innerHTML = alerts.map(item => `
    <div class="alert-item" data-id="${item.stockID}">
      <div class="alert-title">${item.name}</div>
      <div class="alert-sub">
        Expiring in ${item.daysLeft} days · Qty ${item.inStock}
      </div>
    </div>
  `).join("");
}

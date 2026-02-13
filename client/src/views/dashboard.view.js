let salesChartInstance = null;

export function renderDashboardSummary(data) {
  document.getElementById("total-products").textContent = data.totalProducts;
  document.getElementById("total-stock").textContent = data.totalStock;
  document.getElementById("today-sales").textContent = "₹" + data.todaySales;
  document.getElementById("near-expiry").textContent = data.nearExpiry;
}

export function renderSalesChart(
  labels,
  revenueValues,
  lossValues,
  chartLabel,
) {
  const canvas = document.getElementById("salesChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (salesChartInstance) {
    salesChartInstance.destroy();
  }

  salesChartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueValues,
          borderColor: "#4da3ff",
          backgroundColor: "rgba(77, 163, 255, 0.15)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 25, 
          pointBackgroundColor: "#4da3ff",
        },
        {
          label: "Loss",
          data: lossValues,
          borderColor: "#ff4d4d",
          backgroundColor: "rgba(255, 77, 77, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHitRadius: 25, 
          pointBackgroundColor: "#ff4d4d",
        },
      ],
    },
    options: {
      responsive: true,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: {
          labels: {
            color: "#333",
            font: { weight: "600" },
          },
        },
        title: {
          display: true,
          text: chartLabel,
          color: "#333",
          font: {
            size: 16,
            weight: "600",
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#1a1a1a",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
        },
      },

      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#666" },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: { color: "#666" },
        },
      },
    },
  });
}

// 🔹 Biggest Revenue Days List
export function renderExpiryList(items) {
  const list = document.getElementById("big-rev-list");
  if (!list) return;

  list.innerHTML = items
    .map(
      (item) =>
        `<li>
            <span>${item.name}</span>
            <strong>${item.daysLeft}</strong>
        </li>`,
    )
    .join("");
}

// 🔹 Recent Orders List
export function renderOrderList(orders) {
  const list = document.getElementById("order-list");
  if (!list) return;

  list.innerHTML = orders
    .map(
      (order) =>
        `<li>
            <span>#${order.id}</span>
            <strong>₹${order.amount}</strong>
        </li>`,
    )
    .join("");
}

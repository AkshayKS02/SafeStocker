import { DOM } from "../core/dom.js";
import {
    renderDashboardSummary,
    renderSalesChart,
    renderExpiryList,
    renderOrderList
} from "../views/dashboard.view.js";

let currentChartType = "Hours";

// 🔹 Load chart data from backend
async function loadChartData(type) {
    try {
        const res = await fetch(
            `http://localhost:5000/dashboard/graph?type=${type.toLowerCase()}`,
            { credentials: "include" }
        );

        const data = await res.json();

        const revenueMap = {};
        data.revenue.forEach(r => revenueMap[r.label] = r.value);

        const lossMap = {};
        data.loss.forEach(l => lossMap[l.label] = l.value);

        const labels = [...new Set([
            ...data.revenue.map(r => r.label),
            ...data.loss.map(l => l.label)
        ])].sort((a, b) => a - b);

        const revenueValues = labels.map(l => revenueMap[l] || 0);
        const lossValues = labels.map(l => lossMap[l] || 0);

        // Now pass BOTH revenue & loss
        renderSalesChart(labels, revenueValues, lossValues, data.label);

    } catch (err) {
        console.error("Chart load failed:", err);
    }
}

// 🔹 Chart filter buttons
function initChartButtons() {
    const buttons = document.querySelectorAll(".chart-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {

            const type = btn.textContent.trim();
            if (type === currentChartType) return;

            currentChartType = type;

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            loadChartData(type);
        });
    });
}

async function initDashboardData() {
    try {

        // 🔹 Overview
        const overviewRes = await fetch(
            "http://localhost:5000/dashboard/overview",
            { credentials: "include" }
        );
        const overview = await overviewRes.json();

        renderDashboardSummary({
            totalProducts: overview.totalProducts,
            totalStock: overview.totalStockUnits,
            todaySales: overview.todaysSales,
            nearExpiry: overview.nearExpiry
        });

        // 🔹 Biggest Revenue Days
        const daysRes = await fetch(
            "http://localhost:5000/dashboard/biggest-days",
            { credentials: "include" }
        );
        const biggestDays = await daysRes.json();

        renderExpiryList(
            biggestDays.map(d => ({
                name: new Date(d.day).toLocaleDateString(),
                daysLeft: `₹${d.revenue}`
            }))
        );

        // 🔹 Recent Orders
        const ordersRes = await fetch(
            "http://localhost:5000/dashboard/orders",
            { credentials: "include" }
        );
        const orders = await ordersRes.json();

        renderOrderList(
            orders.map(o => ({
                id: o.ReceiptID,
                amount: o.TotalAmount
            }))
        );

        // 🔹 Load default chart (Hours)
        loadChartData(currentChartType);

    } catch (err) {
        console.error("Dashboard load failed:", err);
    }
}

function initDashboard() {
    if (!DOM.views.dashboard) return;

    initDashboardData();
    initChartButtons();
}

initDashboard();


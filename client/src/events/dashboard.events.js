import { DOM } from "../core/dom.js";
import {
    renderDashboardSummary,
    renderSalesChart,
    renderExpiryList,
    renderOrderList
} from "../views/dashboard.view.js";
import { apiFetch } from "../services/api.js";

let currentChartType = "Hours";
let chartButtonsInitialized = false;

async function loadChartData(type) {
    try {
        const res = await apiFetch(`/dashboard/graph?type=${type.toLowerCase()}`);
        if (!res) return;

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

        renderSalesChart(labels, revenueValues, lossValues);

    } catch (err) {
        console.error("Chart load failed:", err);
    }
}

function initChartButtons() {
    if (chartButtonsInitialized) return;

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

    chartButtonsInitialized = true;
}

async function initDashboardData() {
    try {
        const overviewRes = await apiFetch("/dashboard/overview");
        if (!overviewRes) return;

        const overview = await overviewRes.json();

        renderDashboardSummary({
            totalProducts: overview.totalProducts,
            totalStock: overview.totalStockUnits,
            todaySales: overview.todaysSales,
            nearExpiry: overview.nearExpiry
        });

        const daysRes = await apiFetch("/dashboard/biggest-days");
        if (!daysRes) return;

        const biggestDays = await daysRes.json();

        renderExpiryList(
            Array.isArray(biggestDays)
                ? biggestDays.map(d => ({
                    name: new Date(d.day).toLocaleDateString(),
                    daysLeft: `₹${d.revenue}`
                }))
                : []
        );

        const ordersRes = await apiFetch("/dashboard/orders");
        if (!ordersRes) return;

        const orders = await ordersRes.json();

        renderOrderList(
            Array.isArray(orders)
                ? orders.map(o => ({
                    id: o.ReceiptID,
                    amount: o.TotalAmount
                }))
                : []
        );

        loadChartData(currentChartType);

    } catch (err) {
        console.error("Dashboard load failed:", err);
    }
}

export function initDashboard() {
    if (!DOM.views.dashboard) return;

    initDashboardData();
    initChartButtons();
}

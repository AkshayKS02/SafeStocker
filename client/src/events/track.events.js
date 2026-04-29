import { DOM } from "../core/dom.js";
import { stockItems, loadStock } from "../stock.js";
import { renderTrackCards } from "../views/track.view.js";
import { apiFetch } from "../services/api.js";

function sortByName() {
    stockItems.sort((a, b) => a.name.localeCompare(b.name));
    renderTrackCards();
}

function sortByQuantity() {
    stockItems.sort((a, b) => a.inStock - b.inStock);
    renderTrackCards();
}

function sortByExpiry() {
    stockItems.sort((a, b) => {
        if (!a.expiry && !b.expiry) return 0;
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        return new Date(a.expiry) - new Date(b.expiry);
    });
    renderTrackCards();
}

async function handleDelete(stockID) {
    try {
        const response = await apiFetch(`/stock/expire/${stockID}`, {
            method: "DELETE"
        });

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Delete failed");
            return;
        }

        await loadStock();
        renderTrackCards();

        alert("Expired stock cleared. Loss recorded.");

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

export function attachTrackEvents() {
    if (DOM.track.sortName) DOM.track.sortName.onclick = sortByName;
    if (DOM.track.sortQty) DOM.track.sortQty.onclick = sortByQuantity;
    if (DOM.track.sortDate) DOM.track.sortDate.onclick = sortByExpiry;

    if (DOM.track.container) {
        DOM.track.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".delete-btn");
            if (!btn) return;

            const stockID = btn.dataset.stockId;

            if (confirm("Mark this expired stock as lost?")) {
                handleDelete(stockID);
            }
        });
    }
}
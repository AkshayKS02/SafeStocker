// src/events/track.events.js
import { DOM } from "../core/dom.js";
import { stockItems } from "../stock.js";
import { renderTrackCards } from "../views/track.view.js";

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
        const response = await fetch(
            `/stock/expire/${stockID}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Delete failed");
            return;
        }

        // Refetch updated stock list from backend
        await loadStockFromServer();

        renderTrackCards();

        alert("Expired stock cleared. Loss recorded.");

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

function attachTrackEvents() {
    if (DOM.track.sortName) {
        DOM.track.sortName.addEventListener("click", sortByName);
    }

    if (DOM.track.sortQty) {
        DOM.track.sortQty.addEventListener("click", sortByQuantity);
    }

    if (DOM.track.sortDate) {
        DOM.track.sortDate.addEventListener("click", sortByExpiry);
    }

    // DELETE EVENT (event delegation)
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


attachTrackEvents();

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
}

attachTrackEvents();

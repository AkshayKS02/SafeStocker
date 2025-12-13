// src/views/track.view.js
import { DOM } from "../core/dom.js";
import { STOCK_ITEMS } from "../stock.js"; 
import { log } from "../utils/logger.js";

log("track.view.js loaded", 'info');

/**
 * Renders the stock items in the track view grid.
 * This is called by the nav.events.js after stock is loaded.
 */
export function renderTrackCards() {
    log("renderTrackCards() start", 'action');
    const container = DOM.track.container;

    if (!container) {
        log("Track items container NOT found", 'error');
        return;
    }

    if (STOCK_ITEMS.length === 0) {
        container.innerHTML = "<p>No stock found.</p>";
        log("No stock items found, rendering message", 'ui');
        return;
    }

    const html = STOCK_ITEMS.map(
        (item) => `
        <div class="item-card ${item.color}">
          <div class="item-title">${item.name}</div>
          <div class="item-meta">Barcode: <span class="barcode">${item.barcode}</span></div>
          <div class="qty-box">In Stock: ${item.inStock}</div>
          <div class="status">
            <span class="status-dot ${item.color}"></span> 
            ${item.color === 'red' ? 'EXPIRED' : item.color === 'yellow' ? `Expiring in ${item.daysLeft} days` : `Fresh`}
          </div>
        </div>
      `
    ).join("");

    container.innerHTML = html;
    log(`Rendered ${STOCK_ITEMS.length} track cards`, 'ui');
    log("renderTrackCards() end", 'end');
}

/**
 * Attaches the sorting event listeners.
 */
function attachSortListeners() {
    log("attachSortListeners() start", 'action');

    const sortByName = () => {
        log("Sorting by name clicked", 'click');
        STOCK_ITEMS.sort((a, b) => a.name.localeCompare(b.name));
        renderTrackCards();
    };

    const sortByQty = () => {
        log("Sorting by quantity clicked", 'click');
        STOCK_ITEMS.sort((a, b) => a.inStock - b.inStock);
        renderTrackCards();
    };

    const sortByDate = () => {
        log("Sorting by date clicked", 'click');
        STOCK_ITEMS.sort((a, b) => {
            // Null or empty expiry date goes to the end
            if (!a.expiry && !b.expiry) return 0;
            if (!a.expiry) return 1;
            if (!b.expiry) return -1;
            return new Date(a.expiry) - new Date(b.expiry);
        });
        renderTrackCards();
    };

    if (DOM.track.sortName) {
        DOM.track.sortName.addEventListener("click", sortByName);
        log("Listener attached to sort-name", 'attach');
    } else {
        log("sort-name button NOT found", 'error');
    }

    if (DOM.track.sortQty) {
        DOM.track.sortQty.addEventListener("click", sortByQty);
        log("Listener attached to sort-qty", 'attach');
    } else {
        log("sort-qty button NOT found", 'error');
    }

    if (DOM.track.sortDate) {
        DOM.track.sortDate.addEventListener("click", sortByDate);
        log("Listener attached to sort-date", 'attach');
    } else {
        log("sort-date button NOT found", 'error');
    }

    log("attachSortListeners() end", 'end');
}

// Call to attach the listeners when the file loads
attachSortListeners();
// src/views/track.view.js
import { DOM } from "../core/dom.js";
import { stockItems } from "../stock.js";

export function renderTrackCards() {
    const container = DOM.track.container;
    if (!container) return;

    if (stockItems.length === 0) {
        container.innerHTML = "<p>No stock found.</p>";
        return;
    }

    container.innerHTML = stockItems.map(item => `
        <div class="item-card ${item.color}">
            <div class="item-title">${item.name}</div>

            <div class="item-meta">
                Barcode: <span class="barcode">${item.barcode}</span>
            </div>

            <div class="qty-box">
                In Stock: ${item.inStock}
            </div>

            <div class="status">
                <span class="status-dot ${item.color}"></span>
                ${
                    item.color === "red"
                        ? "EXPIRED"
                        : item.color === "yellow"
                        ? `Expiring in ${item.daysLeft} days`
                        : "Fresh"
                }
            </div>
        </div>
    `).join("");
}

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

    container.innerHTML = stockItems.map(item => {
        const showDelete = item.color === "red" && item.inStock > 0;

        return `
            <div class="item-card ${item.color}" data-stock-id="${item.stockID}">
                <div class="item-title">${item.name}</div>

                ${
                    showDelete
                    ? `
                    <button class="delete-btn" data-stock-id="${item.stockID}">
                        <img src="images/delete.png" class="delete-icon" alt="Delete">
                    </button>
                    `
                    : ""
                }

                <div class="item-meta">
                    Barcode: <span class="barcode">${item.barcode}</span>
                </div>

                <div class="qty-box">
                    In Stock: ${item.inStock}
                </div>

                <div class="status">
                    <span class="status-dot ${item.color}"></span>
                    ${
                        item.color === "gray"
                            ? "No expiry info"
                        : item.color === "red"
                            ? "EXPIRED"
                        : item.color === "orange"
                            ? `Critical • ${item.daysLeft} days left`
                        : item.color === "yellow"
                            ? `Expiring soon • ${item.daysLeft} days`
                        : "Fresh"
                    }
                </div>
            </div>
        `;
    }).join("");

}

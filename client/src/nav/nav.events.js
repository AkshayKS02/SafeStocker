// src/nav/nav.events.js
import { DOM } from "../core/dom.js";
import { showView } from "./nav.ui.js";
import { log } from "../utils/logger.js";
// Import all rendering functions that are called after view switch
import { renderTrackCards } from "../views/track.view.js";
import { renderBillingProducts } from "../views/billing.view.js";

log("nav.events.js loaded", 'info');

/**
 * Attaches a click listener to a navigation button.
 * @param {HTMLElement} btn - The navigation button element.
 * @param {string} viewName - The corresponding view name (e.g., "home").
 */
function attachViewListener(btn, viewName) {
    if (!btn) {
        log(`${viewName} button NOT found`, 'error');
        return;
    }

    log(`${viewName} button found`, 'success');

    const handler = async () => {
        log(`Nav button clicked: ${viewName}`, 'click');
        
        // Data Loading Logic
        if (viewName === 'track' || viewName === 'billing') {
            const { loadStock, STOCK_ITEMS } = await import('../stock.js');
            log(`Loading stock for ${viewName} view...`, 'action');
            await loadStock();
            log(`Stock loaded for ${viewName} view.`, 'end');

            // Render UI after data is ready
            if (viewName === 'track') {
                renderTrackCards();
            } else if (viewName === 'billing') {
                renderBillingProducts(STOCK_ITEMS);
            }
        }

        showView(viewName, btn);
        log(`showView(${viewName}) executed`, 'end');
    };
    
    btn.addEventListener("click", handler);
    log(`Listener attached to ${viewName} button`, 'attach');
}

attachViewListener(DOM.nav.homeBtn, "home");
attachViewListener(DOM.nav.trackBtn, "track");
attachViewListener(DOM.nav.billingBtn, "billing");
attachViewListener(DOM.nav.addBtn, "entry");
attachViewListener(DOM.nav.addStockBtn, "stock");

// Initial state and special buttons

// Show home view on initial load
showView("home", DOM.nav.homeBtn);

if (DOM.nav.getStartedBtn) {
    DOM.nav.getStartedBtn.addEventListener("click", () => {
        log("Get Started button clicked", 'click');
        import("../auth/auth.ui.js").then(({ openLogin }) => {
            openLogin();
        });
    });
    log("Listener attached to Get Started button", 'attach');
} else {
    log("Get Started button NOT found", 'error');
}

// Learn More Scroll Logic
if (DOM.home.learnMoreBtn) {
    DOM.home.learnMoreBtn.addEventListener("click", (e) => {
        log("Learn More button clicked", 'click');
        e.preventDefault();

        showView("home", DOM.nav.homeBtn);

        setTimeout(() => {
            if (DOM.home.aboutSection) {
                const yCoordinate =
                    DOM.home.aboutSection.getBoundingClientRect().top + window.scrollY - 75;
                window.scrollTo({ top: yCoordinate, behavior: "smooth" });
                log("Smooth scroll executed to about-section", 'ui');
            } else {
                log("About section NOT found for scrolling", 'error');
            }
        }, 300);
    });
    log("Listener attached to Learn More button", 'attach');
} else {
    log("Learn More button NOT found", 'error');
}
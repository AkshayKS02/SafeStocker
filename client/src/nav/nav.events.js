// src/nav/nav.events.js
import { DOM } from "../core/dom.js";
import { showView } from "./nav.ui.js";
import { loadStock, stockItems } from "../stock.js";
import { renderTrackCards } from "../views/track.view.js";
import { renderBillingProducts } from "../views/billing.view.js";

function attachViewListener(btn, viewName) {
    if (!btn) return;

    btn.addEventListener("click", async () => {

        // Views that need stock data
        if (viewName === "track" || viewName === "billing") {
            await loadStock();

            if (viewName === "track") {
                renderTrackCards();
            }

            if (viewName === "billing") {
                renderBillingProducts(stockItems);
            }
        }

        showView(viewName, btn);
    });
}

attachViewListener(DOM.nav.dashboardBtn, "dashboard");
attachViewListener(DOM.nav.trackBtn, "track");
attachViewListener(DOM.nav.billingBtn, "billing");
attachViewListener(DOM.nav.addBtn, "entry");
attachViewListener(DOM.nav.addStockBtn, "stock");

// Default view
showView("dashboard", DOM.nav.dashboardBtn);


// Get Started → Login modal
if (DOM.nav.getStartedBtn) {
    DOM.nav.getStartedBtn.addEventListener("click", () => {
        import("../auth/auth.ui.js").then(({ openLogin }) => openLogin());
    });
}

// Learn More → scroll to About
if (DOM.home.learnMoreBtn) {
    DOM.home.learnMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showView("home", null);

        setTimeout(() => {
            if (!DOM.home.aboutSection) return;
            const y =
                DOM.home.aboutSection.getBoundingClientRect().top +
                window.scrollY -
                75;
            window.scrollTo({ top: y, behavior: "smooth" });
        }, 300);
    });
}

const title = document.getElementById("title-link");
if (title) {
    title.addEventListener("click", () => {
        showView("home", null);
    });
}

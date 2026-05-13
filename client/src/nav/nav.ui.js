// src/nav/nav.ui.js
import { DOM } from "../core/dom.js";

export function showView(viewName, buttonElement) {
    // Hide all views
    Object.values(DOM.views).forEach(el => {
        if (el) el.style.display = "none";
    });

    // Show target view
    const targetView = DOM.views[viewName];
    if (!targetView) return;
    targetView.style.display = "block";

    // Update active nav button
    DOM.nav.all.forEach(b => b.classList.remove("active-nav-button"));
    if (buttonElement) buttonElement.classList.add("active-nav-button");
}

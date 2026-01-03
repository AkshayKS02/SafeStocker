// src/nav/nav.ui.js
import { DOM } from "../core/dom.js";

export function showView(viewName, buttonElement) {

    // 1. Hide all views
    Object.entries(DOM.views).forEach(([name, el]) => {
        if (!el) {
            log(`View missing: ${name}`, 'error');
            return;
        }
        el.style.display = "none";
    });

    // 2. Show the target view
    const targetView = DOM.views[viewName];
    if (!targetView) {
        return;
    }
    targetView.style.display = "block";

    // 3. Deactivate all buttons
    DOM.nav.all.forEach(b => b.classList.remove("active-nav-button"));
    // 4. Activate the clicked button
    if (buttonElement) {
        buttonElement.classList.add("active-nav-button");
    }
}
// src/nav/nav.ui.js
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";

log("nav.ui.js loaded", 'info');

export function showView(viewName, buttonElement) {
    log(`showView(${viewName}) start`, 'action');

    // 1. Hide all views
    Object.entries(DOM.views).forEach(([name, el]) => {
        if (!el) {
            log(`View missing: ${name}`, 'error');
            return;
        }
        el.style.display = "none";
        log(`View ${name} hidden`, 'ui');
    });

    // 2. Show the target view
    const targetView = DOM.views[viewName];
    if (!targetView) {
        log(`Target view NOT found: ${viewName}`, 'error');
        return;
    }
    targetView.style.display = "block";
    log(`View ${viewName} shown`, 'ui');

    // 3. Deactivate all buttons
    DOM.nav.all.forEach(b => b.classList.remove("active-nav-button"));
    log('All nav buttons deactivated', 'ui');

    // 4. Activate the clicked button
    if (buttonElement) {
        buttonElement.classList.add("active-nav-button");
        log(`Button for ${viewName} activated`, 'ui');
    }

    log(`showView(${viewName}) end`, 'end');
}
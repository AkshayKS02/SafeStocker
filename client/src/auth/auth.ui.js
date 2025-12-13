// src/auth/auth.ui.js
import { DOM } from "../core/dom.js";
import { log } from "../utils/logger.js";

log("auth.ui.js loaded", 'info');

export function openLogin() {
    log("openLogin() start", 'action');

    if (!DOM.auth.loginModal) {
        log("login-modal NOT found", 'error');
        return;
    }

    DOM.auth.loginModal.style.display = "flex";
    log("login-modal display = flex", 'ui');

    log("openLogin() end", 'end');
}

export function closeLogin() {
    log("closeLogin() start", 'action');

    if (!DOM.auth.loginModal) {
        log("login-modal NOT found", 'error');
        return;
    }

    DOM.auth.loginModal.style.display = "none";
    log("login-modal display = none", 'ui');

    log("closeLogin() end", 'end');
}
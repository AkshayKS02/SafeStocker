// src/auth/auth.ui.js
import { DOM } from "../core/dom.js";

export function openLogin() {
    if (!DOM.auth.loginModal) return;
    DOM.auth.loginModal.style.display = "flex";
}

export function closeLogin() {
    if (!DOM.auth.loginModal) return;
    DOM.auth.loginModal.style.display = "none";
}

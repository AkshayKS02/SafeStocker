// src/auth/auth.events.js
import { DOM } from "../core/dom.js";
import { openLogin, closeLogin } from "./auth.ui.js";
import { manualLogin, checkGoogleLogin } from "../auth.js"; // Import logic
import { log } from "../utils/logger.js";

log("auth.events.js loaded", 'info');

// 1. Initial Google Login Check
checkGoogleLogin();

// 2. Open Modal Listener (pre-login state)
if (DOM.auth.userBtn) {
    DOM.auth.userBtn.addEventListener("click", (e) => {
        log("User button clicked (pre-login)", 'click');
        if (!DOM.auth.userCard || DOM.auth.userCard.classList.contains("hidden")) {
            e.stopPropagation();
            openLogin();
        }
    });
    log("Listener attached to user-button (pre-login)", 'attach');
} else {
    log("user-button NOT found", 'error');
}

// 3. Close Modal Listener
if (DOM.auth.closeModal) {
    DOM.auth.closeModal.addEventListener("click", () => {
        log("Modal close button clicked", 'click');
        closeLogin();
    });
    log("Listener attached to modal-close-button", 'attach');
} else {
    log("modal-close-button NOT found", 'error');
}

// 4. Manual Login Form Submit
if (DOM.auth.loginForm) {
    DOM.auth.loginForm.addEventListener("submit", async (e) => {
        log("Login form submitted", 'click');
        e.preventDefault();

        const phone = DOM.auth.usernameInput.value.trim();
        if (!phone) {
            log("Phone input is empty", 'error');
            return;
        }

        await manualLogin(phone, "Owner"); 

        DOM.auth.loginForm.reset();
        log("Login form reset", 'ui');
    });
    log("Listener attached to login-form", 'attach');
} else {
    log("login-form NOT found", 'error');
}
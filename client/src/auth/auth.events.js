// src/auth/auth.events.js
import { DOM } from "../core/dom.js";
import { openLogin, closeLogin } from "./auth.ui.js";
import { manualLogin, checkGoogleLogin } from "./auth.js";

// Restore Google login if redirected
checkGoogleLogin();

// ---------- Pre-login click handler ----------
function handlePreLoginClick(e) {
    if (!DOM.auth.userCard || DOM.auth.userCard.classList.contains("hidden")) {
        e.stopPropagation();
        openLogin();
    }
}

// Attach pre-login listener
if (DOM.auth.userBtn) {
    DOM.auth.userBtn.addEventListener("click", handlePreLoginClick);
}

// Disable pre-login listener AFTER login
export function disablePreLoginClick() {
    if (DOM.auth.userBtn) {
        DOM.auth.userBtn.removeEventListener("click", handlePreLoginClick);
    }
}

// Close login modal
if (DOM.auth.closeModal) {
    DOM.auth.closeModal.addEventListener("click", closeLogin);
}

// Manual login submit
if (DOM.auth.loginForm) {
    DOM.auth.loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const phone = DOM.auth.usernameInput.value.trim();
        if (!phone) return;

        await manualLogin(phone, "Owner");
        DOM.auth.loginForm.reset();
    });
}

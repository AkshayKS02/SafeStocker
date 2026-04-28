import { DOM } from "../core/dom.js";
import { openLogin, closeLogin } from "./auth.ui.js";

// ---------- Pre-login click ----------
function handlePreLoginClick(e) {
    if (!DOM.auth.userCard || DOM.auth.userCard.classList.contains("hidden")) {
        e.stopPropagation();
        openLogin();
    }
}

if (DOM.auth.userBtn) {
    DOM.auth.userBtn.addEventListener("click", handlePreLoginClick);
}

export function disablePreLoginClick() {
    if (DOM.auth.userBtn) {
        DOM.auth.userBtn.removeEventListener("click", handlePreLoginClick);
    }
}

// Close modal
if (DOM.auth.closeModal) {
    DOM.auth.closeModal.addEventListener("click", closeLogin);
}

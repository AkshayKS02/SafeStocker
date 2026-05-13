import { DOM } from "../core/dom.js";
import { openLogin, closeLogin } from "./auth.ui.js";
import { applyUserUI } from "./auth.js";

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

// ---------- Tab switching ----------
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

if (tabLogin && tabSignup) {
    tabLogin.addEventListener("click", () => {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        tabLogin.classList.add("active-tab");
        tabSignup.classList.remove("active-tab");
    });

    tabSignup.addEventListener("click", () => {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        tabSignup.classList.add("active-tab");
        tabLogin.classList.remove("active-tab");
    });
}

// ---------- Login form ----------
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("username")?.value?.trim();
        const password = document.getElementById("password")?.value;

        if (!email || !password) return;

        try {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Login failed");
                return;
            }

            localStorage.setItem("auth_token", data.token);
            closeLogin();
            await applyUserUI(data.user);

        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed. Please try again.");
        }
    });
}

// ---------- Signup form ----------
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const OwnerName = document.getElementById("signup-name")?.value?.trim();
        const Email = document.getElementById("signup-email")?.value?.trim();
        const Password = document.getElementById("signup-password")?.value;

        if (!OwnerName || !Email || !Password) return;

        try {
            const res = await fetch("/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ OwnerName, Email, Password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Signup failed");
                return;
            }

            localStorage.setItem("auth_token", data.token);
            closeLogin();
            await applyUserUI(data.user);

        } catch (err) {
            console.error("Signup error:", err);
            alert("Signup failed. Please try again.");
        }
    });
}

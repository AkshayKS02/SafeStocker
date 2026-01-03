// src/auth/auth.js
import { setShopID, loadStock } from "../stock.js";
import { closeLogin } from "./auth.ui.js";
import { disablePreLoginClick } from "./auth.events.js";

export const currentUser = {
    ShopID: null,
    OwnerName: "",
    Email: "",
    Picture: "",
    loggedIn: false
};

let outsideClickBound = false;

export async function applyUserUI(shop) {
    if (!shop) return;

    disablePreLoginClick();

    currentUser.ShopID = shop.ShopID;
    currentUser.OwnerName = shop.OwnerName;
    currentUser.Email = shop.Email;
    currentUser.Picture = shop.picture || "";
    currentUser.loggedIn = true;

    setShopID(shop.ShopID);
    await loadStock();

    // Initialize stock UI AFTER login
    import("../events/stock.events.js").then(m => m.initStockView());

    const userBtn = document.getElementById("user-button");
    const userIcon = document.getElementById("user-icon");
    const userCard = document.getElementById("user-card");
    const userName = document.getElementById("user-card-name");
    const logoutBtn = document.getElementById("logout-btn");

    if (userName) userName.textContent = shop.OwnerName;

    if (userIcon) {
        userIcon.src = shop.picture || "/images/user.png";
        userIcon.className = shop.picture ? "google-profile-pic" : "";
    }

    if (userBtn && userCard) {
        userBtn.onclick = (e) => {
            e.stopPropagation();
            userCard.classList.toggle("hidden");
        };

        if (!outsideClickBound) {
            document.addEventListener("click", (e) => {
                if (
                    !userCard.classList.contains("hidden") &&
                    !userCard.contains(e.target) &&
                    !userBtn.contains(e.target)
                ) {
                    userCard.classList.add("hidden");
                }
            });
            outsideClickBound = true;
        }
    }

    if (logoutBtn) {
        logoutBtn.onclick = logoutUser;
    }
}

export async function manualLogin(phone, ownerName) {
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, ownerName })
    });

    const data = await res.json();
    if (!data.success) {
        alert(data.message || "Login failed");
        return;
    }

    closeLogin();
    await applyUserUI(data.shop);
}

export async function logoutUser() {
    await fetch("/auth/logout", { method: "GET" });
    window.location.reload();
}

export async function checkGoogleLogin() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_login") !== "1") return;

    const res = await fetch("/auth/google/user", {
        credentials: "include"
    });

    const data = await res.json();
    if (data.loggedIn && data.shopFound) {
        await applyUserUI(data.shop);
    }
}

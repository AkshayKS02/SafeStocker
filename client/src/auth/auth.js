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

// ======================
// 🔹 APPLY USER UI
// ======================
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

    import("../events/stock.events.js").then(m => m.initStockView());

    const userBtn = document.getElementById("user-button");
    const userIcon = document.getElementById("user-icon");
    const userCard = document.getElementById("user-card");
    const userName = document.getElementById("user-card-name");
    const logoutBtn = document.getElementById("logout-btn");

    if (userName) userName.textContent = shop.OwnerName;

    if (userIcon) {
        userIcon.referrerPolicy = "no-referrer";

        userIcon.onerror = () => {
            userIcon.onerror = null;
            userIcon.src = "/images/user.png";
            userIcon.className = "";
        };

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

// ======================
// 🔹 CHECK AUTH (JWT)
// ======================
export async function checkAuthOnLoad() {
    const token = localStorage.getItem("auth_token");
    if (!token) return false;

    try {
        const res = await fetch("/auth/user", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const shop = await res.json();
        await applyUserUI(shop);
        return true;

    } catch (err) {
        console.error("Auth failed", err);
        localStorage.removeItem("auth_token");
        return false;
    }
}

// ======================
// 🔹 LOGOUT
// ======================
export function logoutUser() {
    localStorage.removeItem("auth_token");
    window.location.reload();
}

// src/auth.js
import { setShopID, loadStock } from "./stock.js";
import { DOM } from "./core/dom.js";
import { log } from "./utils/logger.js";
import { closeLogin } from "./auth/auth.ui.js"; 

log("auth.js loaded", 'info');

export const currentUser = {
  OwnerName: "",
  Email: "",
  Picture: "",
  ShopID: null,
  loggedIn: false,
};

let listenersBound = false;

export async function applyUserUI(shop) {
  log("applyUserUI() start", 'action');
  if (!shop) {
    log("applyUserUI called with no shop data", 'error');
    return;
  }

  // 1. Update global state
  currentUser.OwnerName = shop.OwnerName;
  currentUser.Email = shop.Email;
  currentUser.Picture = shop.picture || "";
  currentUser.ShopID = shop.ShopID;
  currentUser.loggedIn = true;

  log(`User logged in: ${shop.OwnerName} (ShopID: ${shop.ShopID})`, 'success');

  setShopID(shop.ShopID);
  await loadStock();
  
  // 4. Update UI
  if (DOM.auth.userCardName) DOM.auth.userCardName.textContent = shop.OwnerName;
  if (DOM.auth.userIcon) {
    if (shop.picture) {
      DOM.auth.userIcon.src = shop.picture;
      DOM.auth.userIcon.className = "google-profile-pic";
      log("User profile picture updated", 'ui');
    } else {
      DOM.auth.userIcon.src = "images/user.png";
      DOM.auth.userIcon.className = "";
      log("Default user icon set", 'ui');
    }
  }

  // Disable login modal opening and replace with dropdown toggle
  if (DOM.auth.userBtn) {
    // Remove the temporary listener used by auth.events.js before login
    DOM.auth.userBtn.onclick = null; 
    
    // Add the permanent listener for the dropdown toggle
    DOM.auth.userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.auth.userCard?.classList.toggle("hidden");
      log("User dropdown toggled", 'ui');
    });
    log("User button listener replaced with dropdown toggle", 'attach');
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    // Ensure the card exists and the click is outside both the card and the button
    if (DOM.auth.userCard && !DOM.auth.userCard.contains(e.target) && e.target !== DOM.auth.userBtn) {
      DOM.auth.userCard.classList.add("hidden");
    }
  });

  if (DOM.auth.logoutBtn) {
    DOM.auth.logoutBtn.addEventListener("click", () => {
        log("Logout button clicked", 'click');
        logoutUser();
    });
    log("Logout button listener attached", 'attach');
  }

  log("applyUserUI() end", 'end');
}


// ------------------ LOGOUT ------------------
export function logoutUser() {
  log("logoutUser() start", 'action');
  fetch("http://localhost:5000/auth/logout", { credentials: "include" });

  currentUser.OwnerName = "";
  currentUser.Email = "";
  currentUser.Picture = "";
  currentUser.ShopID = null;
  currentUser.loggedIn = false;
  log("User state reset", 'ui');

  window.location.reload();
  log("Page reload triggered", 'ui');
}

export async function manualLogin(phone, ownerName) {
  log("manualLogin() start", 'action');
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, ownerName }),
  });

  const data = await res.json();
  if (!data.success) {
    log(`Manual Login failed: ${data.message || "Unknown error"}`, 'error');
    alert(data.message || "Login failed");
    return;
  }

  log("Manual Login successful", 'success');
  closeLogin(); // Close the modal on success
  await applyUserUI(data.shop);
  log("manualLogin() end", 'end');
}

export async function checkGoogleLogin() {
  log("checkGoogleLogin() start", 'action');
  const params = new URLSearchParams(window.location.search);
  if (params.get("google_login") !== "1") {
    log("Not a Google login redirect", 'info');
    return;
  }
  log("Detected Google login redirect", 'info');

  try {
    const res = await fetch("http://localhost:5000/auth/google/user", {
      credentials: "include",
    });

    const data = await res.json();
    if (!data.loggedIn || !data.shopFound) {
      log("Google user not logged in or shop not found", 'error');
      return;
    }

    const shop = data.shop;
    if (data.picture) shop.picture = data.picture;

    log("Google user and shop found. Applying UI.", 'success');
    await applyUserUI(shop);

  } catch (err) {
    log(`Google login check error: ${err.message}`, 'error');
  } finally {
    log("checkGoogleLogin() end", 'end');
  }
}
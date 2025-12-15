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

export async function applyUserUI(shop) {
  log("applyUserUI() start", 'action');
  if (!shop) return;

  // 1. Update global state
  currentUser.OwnerName = shop.OwnerName;
  currentUser.Email = shop.Email;
  currentUser.Picture = shop.picture || "";
  currentUser.ShopID = shop.ShopID;
  currentUser.loggedIn = true;

  setShopID(shop.ShopID);
  await loadStock();

  // 2. Update the User Icon Image
  const userIconImg = document.getElementById("user-icon");
  const userCardName = document.getElementById("user-card-name");
  
  if (userCardName) userCardName.textContent = shop.OwnerName;
  if (userIconImg && shop.picture) {
      userIconImg.src = shop.picture;
      userIconImg.className = "google-profile-pic";
  }

  // 3. User Icon Behavior: Swap from "Login" to "Dropdown"
  const userBtn = document.getElementById("user-button");
  const userCard = document.getElementById("user-card");

  if (userBtn) {
    // Remove old listeners using the clone method
    const newBtn = userBtn.cloneNode(true);
    userBtn.parentNode.replaceChild(newBtn, userBtn);

    newBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (userCard) userCard.classList.toggle("hidden");
    });
  }

  // 4. Close dropdown on outside click
  document.addEventListener("click", (e) => {
    const uCard = document.getElementById("user-card");
    const uBtn = document.getElementById("user-button"); 
    
    if (uCard && !uCard.classList.contains("hidden")) {
       if (!uCard.contains(e.target) && uBtn && !uBtn.contains(e.target)) {
           uCard.classList.add("hidden");
       }
    }
  });

  // ---------------------------------------------------------
  // 5. FIX: LOGOUT BUTTON LISTENER
  // ---------------------------------------------------------
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    // We use .onclick here because it is simpler and overwrites 
    // any previous listeners automatically. It just works.
    logoutBtn.onclick = (e) => {
        e.preventDefault(); 
        logoutUser();
    };
    log("Logout button connected", 'success');
  } else {
    log("Logout button NOT found in DOM", 'error');
  }

  log("applyUserUI() end", 'end');
}

// ------------------ LOGOUT ------------------
export async function logoutUser() {
  log("Logging out...", 'action');
  
  try {
      // FIX: Use await so the page doesn't reload before the request finishes
      // Note: Using relative path /auth/logout handles localhost vs production automatically
      await fetch("/auth/logout", { method: "GET" });
      
      currentUser.loggedIn = false;
      log("Session destroyed", 'success');

  } catch (err) {
      console.error("Logout fetch failed", err);
  }

  // Reload page to reset UI to "Logged Out" state
  window.location.reload();
}

export async function manualLogin(phone, ownerName) {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, ownerName }),
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Login failed");
    return;
  }

  closeLogin(); 
  await applyUserUI(data.shop);
}

export async function checkGoogleLogin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("google_login") !== "1") return;

  try {
    const res = await fetch("http://localhost:5000/auth/google/user", {
      credentials: "include",
    });

    const data = await res.json();
    if (data.loggedIn && data.shopFound) {
      const shop = data.shop;
      if (data.picture) shop.picture = data.picture;
      await applyUserUI(shop); 
    }
  } catch (err) {
    console.error(err);
  }
}
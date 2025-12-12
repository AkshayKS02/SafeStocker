import { setShopID, loadStock } from "./stock.js";

// ------------------ GLOBAL USER STATE ------------------
export let currentUser = {
  OwnerName: "",
  Email: "",
  Picture: "",
  ShopID: null,
  loggedIn: false,
};


// ------------------ APPLY USER UI ------------------
export async function applyUserUI(shop) {
  if (!shop) return;

  const userBtn = document.getElementById("user-button");
  const userIcon = document.getElementById("user-icon");
  const userCard = document.getElementById("user-card");
  const userCardName = document.getElementById("user-card-name");
  const logoutBtn = document.getElementById("logout-btn");

  // 1. Update global state
  currentUser = {
    OwnerName: shop.OwnerName,
    Email: shop.Email,
    Picture: shop.picture || "",
    ShopID: shop.ShopID,
    loggedIn: true,
  };

  // 2. Save ShopID globally for stock system
  setShopID(shop.ShopID);

  // 3. Load stock for that shop
  await loadStock();

  // 4. Update UI
  userCardName.textContent = shop.OwnerName;

  if (shop.picture) {
    userIcon.src = shop.picture;
    userIcon.className = "google-profile-pic";
  } else {
    userIcon.src = "images/user.png";
    userIcon.className = "";
  }

  // Disable login modal opening
  userBtn.onclick = null;

  // Toggle profile dropdown
  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userCard.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!userCard.contains(e.target) && e.target !== userBtn) {
      userCard.classList.add("hidden");
    }
  });

  logoutBtn.addEventListener("click", logoutUser);
}


// ------------------ LOGOUT ------------------
export function logoutUser() {
  fetch("http://localhost:5000/auth/logout", { credentials: "include" });

  currentUser = {
    OwnerName: "",
    Email: "",
    Picture: "",
    ShopID: null,
    loggedIn: false,
  };

  window.location.reload();
}


// ------------------ MANUAL LOGIN ------------------
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

  await applyUserUI(data.shop);
}


// ------------------ GOOGLE LOGIN CHECK (after redirect) ------------------
export async function checkGoogleLogin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("google_login") !== "1") return;

  try {
    const res = await fetch("http://localhost:5000/auth/google/user", {
      credentials: "include",
    });

    const data = await res.json();
    if (!data.loggedIn || !data.shopFound) return;

    const shop = data.shop;

    // Add Google picture if available
    if (data.picture) shop.picture = data.picture;

    await applyUserUI(shop);

  } catch (err) {
    console.error("Google login error:", err);
  }
}

import { initApp } from "./core/init.js";
import { initHomeCarousel } from "./views/home.view.js";
import { checkAuthOnLoad } from "./auth/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    await checkAuthOnLoad(); // 🔥 CRITICAL
    initApp();
    initHomeCarousel();
});
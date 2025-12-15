// src/app.js
import { initApp } from "./core/init.js";
import { log } from "./utils/logger.js";
import { initHomeCarousel } from "./views/home.view.js"; 

log("app.js loaded", 'info');

document.addEventListener("DOMContentLoaded", () => {
    // 2. Run the standard App initialization (Nav, Auth, etc.)
    initApp();

    initHomeCarousel();
});
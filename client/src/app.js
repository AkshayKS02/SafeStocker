// src/app.js
import { initApp } from "./core/init.js";
import { initHomeCarousel } from "./views/home.view.js"; 

document.addEventListener("DOMContentLoaded", () => {
    initApp();

    initHomeCarousel();
});
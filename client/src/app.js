// src/app.js
import { initApp } from "./core/init.js";
import { log } from "./utils/logger.js";

log("app.js loaded", 'info');

document.addEventListener("DOMContentLoaded", initApp);

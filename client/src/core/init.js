// src/core/init.js
import { log } from "../utils/logger.js";
// Import all event listeners to attach them on app load
import "../nav/nav.events.js";
import "../auth/auth.events.js";
import "../views/track.view.js";
import "../views/billing.view.js";
import "../views/entry.view.js";
import "../barcode/barcode.events.js"; 

log("init.js loaded", 'info');

export function initApp() {
    log("initApp() start", 'action');
    
    // checkGoogleLogin is called in auth/auth.events.js when ready.

    log("Initial view set by nav/nav.events.js");
    
    log("initApp() end", 'end');
}
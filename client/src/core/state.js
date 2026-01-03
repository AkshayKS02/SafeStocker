// src/core/state.js

export const state = {
    user: null, // Full user object from API
    activeView: "home",
    scannedItem: null, // Used by the entry view
    // The current stock data. We will rely on stock.js for the master list.
};
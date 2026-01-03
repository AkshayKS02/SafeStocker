    // src/core/dom.js

    export const DOM = {
        // Views
        views: {
            home: document.getElementById("home-view"),
            track: document.getElementById("track-view"),
            billing: document.getElementById("billing-view"),
            entry: document.getElementById("entry-view"),
            stock: document.getElementById("stock-view"),
        },
        // Navigation Buttons
        nav: {
            all: document.querySelectorAll(".nav-button"),
            homeBtn: document.getElementById("home-button"),
            trackBtn: document.getElementById("track-button"),
            billingBtn: document.getElementById("billing-button"),
            addBtn: document.getElementById("add-new-button"),
            addStockBtn: document.getElementById("add-stock-button"),
            getStartedBtn: document.getElementById("get-started-button"),
        },
        // Authentication UI
        auth: {
            userBtn: document.getElementById("user-button"),
            loginModal: document.getElementById("login-modal"),
            closeModal: document.getElementById("modal-close-button"),
            loginForm: document.getElementById("login-form"),
            usernameInput: document.getElementById("username"),
            // Added for logout dropdown
            userCard: document.getElementById("user-card"),
            userCardName: document.getElementById("user-card-name"),
            userIcon: document.getElementById("user-icon"),
            logoutBtn: document.getElementById("logout-btn"),
        },
        // Entry View / Forms
        entry: {
            standardToggle: document.getElementById("standard-toggle"),
            customToggle: document.getElementById("custom-toggle"),
            formStandard: document.getElementById("form-standard"),
            formCustom: document.getElementById("form-custom"),
            scanBtn: document.getElementById("scan-btn"), // The main scan button
            scanPreview: document.getElementById("scan-preview-standard"),
            scanNameField: document.getElementById("scan-name-standard"),
            scanCodeField: document.getElementById("scan-barcode-standard"),
            // Standard Form Inputs
            price: document.getElementById("price"),
            
        },
        // Track View
        track: {
            container: document.getElementById("items-container"),
            sortName: document.getElementById("sort-name"),
            sortQty: document.getElementById("sort-qty"),
            sortDate: document.getElementById("sort-date"),
        },
        // Billing View
        billing: {
            search: document.getElementById("billing-search"),
            productsBox: document.querySelector(".billing-products-box"),
            billItemsContainer: document.getElementById("bill-items"),
            billTotalBox: document.getElementById("bill-total"),
        },
        // Home View
        home: {
            learnMoreBtn: document.getElementById("learn-more-button"),
            aboutSection: document.getElementById("about-section"),
            heroImages: document.querySelectorAll(".hero-image"),
        },
        stock: {
            itemSelect: document.getElementById("stock-item-select"),
            form: document.getElementById("stock-form"),
            quantity: document.getElementById("stock-quantity"),
            mfgDate: document.getElementById("stock-manufacture-date"),
            expDate: document.getElementById("stock-expiry-date"),
        }
    };

    Object.values(DOM.views).forEach(el => {
        if (!el) return;
    });

    if (!DOM.auth.userBtn) {
        // optional: auth button not present
    }
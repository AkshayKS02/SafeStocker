// app.js (Full code with all interactivity, including login)

document.addEventListener("DOMContentLoaded", function () {
  // --- 1. Get Elements ---

  // Main View Sections
  const allViews = [
    document.getElementById("home-view"),
    document.getElementById("track-view"),
    document.getElementById("billing-view"),
    document.getElementById("entry-view"),
  ];

  // Navigation Buttons
  const allNavButtons = document.querySelectorAll(".nav-button");
  const homeButton = document.getElementById("home-button");
  const trackButton = document.getElementById("track-button");
  const billingButton = document.getElementById("billing-button");
  const addNewButton = document.getElementById("add-new-button");

  // Form Toggles and Content
  const standardToggle = document.getElementById("standard-toggle");
  const customToggle = document.getElementById("custom-toggle");
  const formStandard = document.getElementById("form-standard");
  const formCustom = document.getElementById("form-custom");

  // NEW: Login Modal Elements
  const userButton = document.getElementById("user-button");
  const loginModal = document.getElementById("login-modal");
  const closeModalButton = document.getElementById("modal-close-button");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");

  // --- 2. Main Navigation Logic (Switches pages) ---

  function switchAppView(viewToShow, buttonToActivate) {
    allViews.forEach((view) => (view.style.display = "none"));
    viewToShow.style.display = "block";

    allNavButtons.forEach((btn) => btn.classList.remove("active-nav-button"));
    buttonToActivate.classList.add("active-nav-button");
  }

  homeButton.addEventListener("click", () =>
    switchAppView(allViews[0], homeButton)
  );
  trackButton.addEventListener("click", () =>
    switchAppView(allViews[1], trackButton)
  );
  billingButton.addEventListener("click", () =>
    switchAppView(allViews[2], billingButton)
  );
  addNewButton.addEventListener("click", () =>
    switchAppView(allViews[3], addNewButton)
  );

  // Initial setup: Show Home view
  switchAppView(allViews[0], homeButton);

  // --- 3. Form Toggle Logic (Switches Standard/Custom forms) ---

  function switchFormToggle(formToShow, toggleToActivate, toggleToDeactivate) {
    formStandard.style.display = "none";
    formCustom.style.display = "none";
    formToShow.style.display = "block";

    toggleToActivate.classList.add("active-toggle");
    toggleToDeactivate.classList.remove("active-toggle");
  }

  if (standardToggle && customToggle) {
    standardToggle.addEventListener("click", () => {
      switchFormToggle(formStandard, standardToggle, customToggle);
    });
    customToggle.addEventListener("click", () => {
      switchFormToggle(formCustom, customToggle, standardToggle);
    });
  }

  // --- 4. NEW: Login Modal Logic ---

  // Open the modal when 'user' button is clicked
  userButton.addEventListener("click", () => {
    loginModal.style.display = "flex"; // Use flex to center it
  });

  // Close the modal when 'X' is clicked
  closeModalButton.addEventListener("click", () => {
    loginModal.style.display = "none";
  });

  // Handle the (simulated) login
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop the form from reloading the page

    const username = usernameInput.value;

    // Check if the user actually typed something
    if (username.trim() !== "") {
      // Update the user button text
      userButton.textContent = `Hi, ${username}`;
      // Close the modal
      loginModal.style.display = "none";
      // Clear the form for next time
      loginForm.reset();
    }
  });

  // --- 5. Track View: Sorting Logic for Table ---

  const filterButtons = document.querySelectorAll(".filter-pill");
  const productTable = document.querySelector(".product-table tbody");

  if (filterButtons && productTable) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rows = Array.from(productTable.querySelectorAll("tr"));
        const column = button.textContent.trim().toLowerCase(); // 'name', 'quantity', 'date'
        const isDate = column === "date";
        const isQuantity = column === "quantity";
        const isName = column === "name";

        rows.sort((a, b) => {
          let A, B;
          if (isDate) {
            A = new Date(a.cells[2].textContent.split("/").reverse().join("-"));
            B = new Date(b.cells[2].textContent.split("/").reverse().join("-"));
            return A - B;
          } else if (isQuantity) {
            A = a.cells[1].textContent.toLowerCase();
            B = b.cells[1].textContent.toLowerCase();
            return A.localeCompare(B);
          } else if (isName) {
            A = a.cells[0].textContent.toLowerCase();
            B = b.cells[0].textContent.toLowerCase();
            return A.localeCompare(B);
          }
        });

        rows.forEach((row) => productTable.appendChild(row));

        // highlight the active filter button
        filterButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }
});
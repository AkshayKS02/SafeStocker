import { showView } from "../nav/nav.ui.js";
import { DOM } from "../core/dom.js";
import { renderTrackCards } from "../views/track.view.js";

document.addEventListener("DOMContentLoaded", () => {
  const bell = document.getElementById("alert-bell");
  const dropdown = document.getElementById("alert-dropdown");

  if (!bell || !dropdown) return;

  // OPEN dropdown
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.remove("hidden");
  });

  // CLICK inside dropdown
  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();

    const alertItem = e.target.closest(".alert-item");
    if (!alertItem) return;

    const stockID = alertItem.dataset.id;

    showView("track", DOM.nav.trackBtn);
    renderTrackCards();

    // wait for DOM to paint
    setTimeout(() => {
      const card = document.querySelector(
        `.item-card[data-stock-id="${stockID}"]`
      );

      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("alert-highlight");

        // optional: remove highlight after a bit
        setTimeout(() => {
          card.classList.remove("alert-highlight");
        }, 3000);
      }
    }, 100);

    dropdown.classList.add("hidden");
  });


  // CLICK anywhere else → CLOSE
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
});

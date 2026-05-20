/* PALOMA Subscription — subscription.html */
function initSubscriptionPage() {
  "use strict";

  const page = document.getElementById("subscriptionPage");
  if (!page) return;

  const form = document.getElementById("subscriptionForm");
  const termButtons = page.querySelectorAll("[data-subscription-term]");
  const sizeButtons = page.querySelectorAll("[data-subscription-size]");

  let selectedTerm = "1 месяц";
  let selectedSize = "S";

  const SUB_ID_PREFIX = "paloma-flower-subscription";
  const SUB_PRICE = 15000;
  const SUB_BG =
    "linear-gradient(135deg, #eaded1 0%, #b98d8b 48%, #643640 100%)";

  function setActiveButton(buttons, activeButton) {
    buttons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  termButtons.forEach((button) => {
    if (button.classList.contains("is-active")) {
      selectedTerm = button.dataset.subscriptionTerm || selectedTerm;
    }
    button.setAttribute(
      "aria-pressed",
      button.classList.contains("is-active") ? "true" : "false",
    );

    button.addEventListener("click", () => {
      selectedTerm = button.dataset.subscriptionTerm || selectedTerm;
      setActiveButton(termButtons, button);
    });
  });

  sizeButtons.forEach((button) => {
    if (button.classList.contains("is-active")) {
      selectedSize = button.dataset.subscriptionSize || selectedSize;
    }
    button.setAttribute(
      "aria-pressed",
      button.classList.contains("is-active") ? "true" : "false",
    );

    button.addEventListener("click", () => {
      selectedSize = button.dataset.subscriptionSize || selectedSize;
      setActiveButton(sizeButtons, button);
    });
  });

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const termSlug = selectedTerm
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zа-яё0-9-]/gi, "");
    const cartId = `${SUB_ID_PREFIX}-${termSlug}-${selectedSize}`;

    if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
      window.PalomaCart.getItems().forEach((item) => {
        if (String(item.id).startsWith(SUB_ID_PREFIX)) {
          window.PalomaCart.remove(item.id);
        }
      });

      window.PalomaCart.add({
        id: cartId,
        name: "Цветочная подписка",
        price: SUB_PRICE,
        qty: 1,
        size: selectedSize,
        category: "subscription",
        type: "subscription",
        bg: SUB_BG,
        addons: [selectedTerm, "от 15 000 ₽"],
      });

      if (typeof window.PalomaCart.openDrawer === "function") {
        window.PalomaCart.openDrawer();
      }

      return;
    }

    window.location.href = "checkout.html";
  });
}

document.addEventListener("DOMContentLoaded", initSubscriptionPage);

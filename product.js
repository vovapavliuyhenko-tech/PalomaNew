/* ════════════════════════════════════════════════════════
   product.js — страница товара PALOMA
   Depends on: paloma-products.js, catalog-data.js, script.js
   ════════════════════════════════════════════════════════ */
(function initProductPage() {
  "use strict";

  const pdpMain = document.getElementById("pdpMain");
  if (!pdpMain) return;

  const ADDONS = [
    {
      id: "addon-coffee",
      name: "Кофе к букету",
      price: 250,
      placeholderBg: "linear-gradient(135deg,#5c3d28,#8a6248)",
      image: "images/addons/coffee.jpg",
      category: "coffee",
    },
    {
      id: "addon-dessert",
      name: "Десерт из витрины",
      price: 320,
      placeholderBg: "linear-gradient(135deg,#c4a882,#8a6248)",
      image: "images/addons/dessert.jpg",
      category: "coffee",
    },
    {
      id: "addon-card",
      name: "Открытка",
      price: 150,
      placeholderBg: "linear-gradient(135deg,#d4bcc8,#8a5858)",
      image: "images/addons/card.jpg",
      category: "vases",
    },
    {
      id: "addon-vase",
      name: "Ваза",
      price: 980,
      placeholderBg: "linear-gradient(135deg,#e0d8cc,#9c8870)",
      image: "images/addons/vase.jpg",
      category: "vases",
    },
    {
      id: "addon-gift-wrap",
      name: "Подарочная упаковка",
      price: 200,
      placeholderBg: "linear-gradient(135deg,#d4c8b8,#8a7860)",
      image: "images/addons/gift-wrap.jpg",
      category: "vases",
    },
  ];

  const notFoundEl = document.getElementById("pdpNotFound");
  const mainPh = document.getElementById("pdpMainPh");
  const mainImg = document.getElementById("pdpMainImg");
  const thumbsEl = document.getElementById("pdpThumbs");
  const catEl = document.getElementById("pdpCat");
  const nameEl = document.getElementById("pdpName");
  const priceEl = document.getElementById("pdpPrice");
  const compRow = document.getElementById("pdpCompositionRow");
  const compEl = document.getElementById("pdpComposition");
  const descEl = document.getElementById("pdpDesc");
  const sizesEl = document.getElementById("pdpSizes");
  const sizeBtnsEl = document.getElementById("pdpSizeBtns");
  const qtyVal = document.getElementById("pdpQtyVal");
  const qtyDec = document.getElementById("pdpQtyDec");
  const qtyInc = document.getElementById("pdpQtyInc");
  const addToCartBtn = document.getElementById("pdpAddToCart");
  const wishBtn = document.getElementById("pdpWishlist");
  const toast = document.getElementById("pdpToast");
  const toastText = document.getElementById("pdpToastText");
  const breadCatLink = document.getElementById("pdpBreadcrumbCatLink");
  const breadNameEl = document.getElementById("pdpBreadcrumbName");
  const addonsGrid = document.getElementById("pdpAddonsGrid");
  const giftToggle = document.getElementById("pdpGiftToggle");
  const giftFields = document.getElementById("pdpGiftFields");
  const cardText = document.getElementById("pdpCardText");
  const recipientName = document.getElementById("pdpRecipientName");
  const recipientPhone = document.getElementById("pdpRecipientPhone");
  const fulfillBtns = document.getElementById("pdpFulfillBtns");
  const deliveryDate = document.getElementById("pdpDeliveryDate");
  const photoBefore = document.getElementById("pdpPhotoBefore");
  const similarSection = document.getElementById("pdpSimilar");
  const similarGrid = document.getElementById("pdpSimilarGrid");

  let fulfillMode = "delivery";

  let product = null;
  let rawProduct = null;
  let qty = 1;
  let selectedSize = null;
  let sizePriceDelta = 0;
  let toastTimer = null;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findProducts(slug) {
    if (!slug) return { norm: null, raw: null };

    if (window.PALOMA_CATALOG) {
      const norm =
        window.PALOMA_CATALOG.getBySlug(slug) ||
        window.PALOMA_CATALOG.getById(slug);
      if (norm) {
        const raw = (window.PALOMA_PRODUCTS || []).find((p) => p.id === norm.id);
        return { norm, raw: raw || null };
      }
    }

    const raw = (window.PALOMA_PRODUCTS || []).find(
      (p) => p.slug === slug || p.id === slug,
    );
    if (!raw) return { norm: null, raw: null };

    const norm = window.PALOMA_CATALOG?.getById(raw.id) || {
      id: raw.id,
      name: raw.name,
      category: raw.categories?.[0] || "online",
      categoryLabel: "",
      price: raw.price,
      composition: raw.composition || "",
      desc: raw.desc || "",
      placeholderBg: raw.placeholderGradient?.main || "",
      placeholderBgHover: raw.placeholderGradient?.hover || null,
      image: raw.image || null,
      imageHover: raw.imageHover || null,
      slug: raw.slug || raw.id,
    };

    return { norm, raw };
  }

  function formatPrice(n) {
    return n.toLocaleString("ru-RU") + " ₽";
  }

  function updatePriceDisplay() {
    if (!priceEl || !product) return;
    priceEl.textContent = formatPrice(product.price + sizePriceDelta);
  }

  function showNotFound() {
    Array.from(pdpMain.children).forEach((el) => {
      if (el.id !== "pdpNotFound") el.hidden = true;
    });
    if (notFoundEl) notFoundEl.hidden = false;
    document.title = "Товар не найден — PALOMA";
  }

  function renderProduct() {
    document.title = `${product.name} — PALOMA`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `${product.name} — ${rawProduct?.desc || product.composition || ""} — PALOMA flowers coffee you`;
    }

    if (breadCatLink) {
      breadCatLink.textContent = product.categoryLabel || "Каталог";
      breadCatLink.href = `catalog.html?cat=${encodeURIComponent(product.category)}`;
    }
    if (breadNameEl) breadNameEl.textContent = product.name;
    if (catEl) catEl.textContent = product.categoryLabel || "";
    if (nameEl) nameEl.textContent = product.name;
    updatePriceDisplay();

    if (product.composition && compEl && compRow) {
      compEl.textContent = product.composition;
    } else if (compRow) {
      compRow.hidden = true;
    }

    const descText = rawProduct?.desc || product.desc || "";
    if (descEl) {
      descEl.textContent = descText;
      descEl.hidden = !descText;
    }

    renderSizes();
    renderGallery();
    bindWishlistButton();
  }

  function renderSizes() {
    const sizes = rawProduct?.sizes;
    if (!sizes?.length || !sizesEl || !sizeBtnsEl) return;

    sizesEl.hidden = false;
    sizeBtnsEl.innerHTML = "";

    sizes.forEach((size, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pdp-size-btn" + (i === 0 ? " is-active" : "");
      btn.textContent = size.label || size.code;
      btn.dataset.size = size.code || size.label;
      btn.dataset.delta = String(size.priceDelta || 0);
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");

      btn.addEventListener("click", () => {
        sizeBtnsEl.querySelectorAll(".pdp-size-btn").forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        selectedSize = btn.dataset.size;
        sizePriceDelta = parseInt(btn.dataset.delta, 10) || 0;
        updatePriceDisplay();
      });

      sizeBtnsEl.appendChild(btn);
    });

    selectedSize = sizes[0].code || sizes[0].label;
    sizePriceDelta = sizes[0].priceDelta || 0;
  }

  function renderGallery() {
    const bg = product.placeholderBg || "";
    const bgHover = product.placeholderBgHover || bg;

    if (mainPh) mainPh.style.background = bg;

    const photos = [];
    if (product.image) photos.push({ src: product.image, alt: product.name });
    if (product.imageHover)
      photos.push({ src: product.imageHover, alt: `${product.name} — вид 2` });

    if (!photos.length) {
      if (mainImg) {
        mainImg.removeAttribute("src");
        mainImg.style.display = "none";
      }
      if (thumbsEl) thumbsEl.innerHTML = "";
      return;
    }

    if (mainImg) mainImg.style.display = "";
    setMainPhoto(photos[0], 0);

    if (!thumbsEl) return;
    thumbsEl.innerHTML = "";

    if (photos.length === 1) return;

    photos.forEach((photo, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pdp-gallery__thumb" + (i === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", `Фото ${i + 1}`);

      const ph = document.createElement("div");
      ph.className = "pdp-gallery__thumb-ph";
      ph.style.background = i === 0 ? bg : bgHover;

      const img = document.createElement("img");
      img.className = "pdp-gallery__thumb-img";
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = "lazy";
      img.onerror = () => {
        img.style.display = "none";
      };

      btn.appendChild(ph);
      btn.appendChild(img);
      btn.addEventListener("click", () => setMainPhoto(photo, i));
      thumbsEl.appendChild(btn);
    });
  }

  function setMainPhoto(photo, index) {
    if (mainImg) {
      mainImg.src = photo.src;
      mainImg.alt = photo.alt;
      mainImg.style.opacity = "1";
      mainImg.onerror = () => {
        mainImg.style.opacity = "0";
      };
    }

    thumbsEl?.querySelectorAll(".pdp-gallery__thumb").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
    });
  }

  function initQty() {
    if (!qtyVal || !qtyDec || !qtyInc) return;

    function update() {
      qtyVal.textContent = String(qty);
      qtyDec.disabled = qty <= 1;
    }

    qtyDec.addEventListener("click", () => {
      if (qty > 1) {
        qty--;
        update();
      }
    });
    qtyInc.addEventListener("click", () => {
      if (qty < 99) {
        qty++;
        update();
      }
    });

    update();
  }

  function addToCart(item) {
    if (window.PalomaCart?.add) {
      window.PalomaCart.add(item);
      return;
    }

    const KEY = "paloma_cart_v3";
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      items = [];
    }

    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
      items.push(item);
    }

    localStorage.setItem(KEY, JSON.stringify(items));
    const count = items.reduce((s, i) => s + (i.qty || 1), 0);
    document
      .querySelectorAll(".site-header__cart-count, #cartCount")
      .forEach((el) => {
        el.textContent = count > 0 ? String(count) : "0";
        el.classList.toggle("is-empty", count === 0);
      });
  }

  function initCart() {
    addToCartBtn?.addEventListener("click", () => {
      if (!product || !rawProduct) return;

      const sizeLabel =
        sizeBtnsEl?.querySelector(".pdp-size-btn.is-active")?.textContent?.trim() ||
        selectedSize ||
        "M";
      const unitPrice = product.price + sizePriceDelta;
      const lineId = `${product.id}-${selectedSize || "m"}`;

      addToCart({
        id: lineId,
        name: product.name,
        price: unitPrice,
        qty,
        size: sizeLabel,
        addons: collectExtras(),
        bg: product.placeholderBg || "",
        category: product.category || "",
      });

      showToast(`«${product.name}» добавлен в корзину`);
    });
  }

  function bindWishlistButton() {
    if (!wishBtn || !product) return;
    wishBtn.dataset.productId = product.id;
    window.PalomaWishlist?.syncButtons?.();
  }

  function showToast(message, duration = 2200) {
    if (!toast || !toastText) return;

    if (toastTimer) {
      clearTimeout(toastTimer);
      toast.classList.remove("is-hiding");
    }

    toastText.textContent = message;
    toast.hidden = false;

    toastTimer = setTimeout(() => {
      toast.classList.add("is-hiding");
      setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove("is-hiding");
      }, 320);
    }, duration);
  }

  function renderAddons() {
    if (!addonsGrid) return;

    ADDONS.forEach((addon) => {
      const card = document.createElement("div");
      card.className = "addon-card";
      card.dataset.addonId = addon.id;

      card.innerHTML = `
        <div class="addon-card__media">
          <div class="addon-card__ph"
               style="background:${esc(addon.placeholderBg)};"
               aria-hidden="true"></div>
          ${
            addon.image
              ? `<img src="${esc(addon.image)}" alt="${esc(addon.name)}"
                      loading="lazy" class="addon-card__img"
                      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
                      onerror="this.style.display='none'">`
              : ""
          }
        </div>
        <div class="addon-card__body">
          <h3 class="addon-card__name">${esc(addon.name)}</h3>
          <p class="addon-card__price">${addon.price.toLocaleString("ru-RU")} ₽</p>
          <button type="button" class="addon-card__btn"
                  data-addon-id="${esc(addon.id)}"
                  aria-label="Добавить ${esc(addon.name)} в корзину">
            Добавить
          </button>
        </div>
      `;

      card.querySelector(".addon-card__btn")?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        addToCart({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          qty: 1,
          size: "—",
          addons: [],
          bg: addon.placeholderBg,
          category: addon.category,
          type: "addon",
          linkedTo: product?.id,
        });

        btn.textContent = "✓ Добавлено";
        btn.classList.add("is-added");
        btn.disabled = true;
        showToast(`«${addon.name}» добавлен в корзину`);

        setTimeout(() => {
          btn.textContent = "Добавить";
          btn.classList.remove("is-added");
          btn.disabled = false;
        }, 2000);
      });

      addonsGrid.appendChild(card);
    });
  }

  function initGiftAndFulfill() {
    if (giftToggle && giftFields) {
      giftToggle.addEventListener("change", () => {
        giftFields.hidden = !giftToggle.checked;
      });
    }
    if (fulfillBtns) {
      const btns = fulfillBtns.querySelectorAll(".pdp-fulfill__btn");
      btns.forEach((btn) => {
        btn.addEventListener("click", () => {
          fulfillMode = btn.dataset.fulfill || "delivery";
          btns.forEach((b) => b.classList.toggle("is-active", b === btn));
        });
      });
    }
  }

  function collectExtras() {
    const extras = [];
    extras.push(fulfillMode === "pickup" ? "Самовывоз" : "Доставка");
    if (deliveryDate && deliveryDate.value) {
      extras.push("Дата: " + deliveryDate.value);
    }
    if (photoBefore && photoBefore.checked) extras.push("Фото перед отправкой");
    if (giftToggle && giftToggle.checked) {
      if (cardText && cardText.value.trim()) {
        extras.push("Открытка: " + cardText.value.trim());
      }
      const rn = recipientName && recipientName.value.trim();
      const rp = recipientPhone && recipientPhone.value.trim();
      if (rn || rp) extras.push("Получатель: " + [rn, rp].filter(Boolean).join(", "));
    }
    return extras;
  }

  function renderSimilar() {
    if (!similarGrid || !similarSection || !window.PALOMA_CATALOG || !product) return;
    const items = window.PALOMA_CATALOG.getSimilar(product.id, 4) || [];
    if (!items.length) return;
    similarGrid.innerHTML = items
      .map(function (p) {
        const href = "product.html?slug=" + encodeURIComponent(p.slug || p.id);
        const media = p.image
          ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
          : '<span class="pdp-similar-card__ph" style="background:' + esc(p.placeholderBg || "") + '"></span>';
        return (
          '<a class="pdp-similar-card" href="' + href + '">' +
          '<span class="pdp-similar-card__media">' + media + "</span>" +
          '<span class="pdp-similar-card__name">' + esc(p.name) + "</span>" +
          '<span class="pdp-similar-card__price">' + formatPrice(p.price) + "</span>" +
          "</a>"
        );
      })
      .join("");
    similarSection.hidden = false;
  }

  function init() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug") || params.get("id");

    if (!slug) {
      showNotFound();
      return;
    }

    const found = findProducts(slug);
    product = found.norm;
    rawProduct = found.raw;

    if (!product) {
      showNotFound();
      return;
    }

    renderProduct();
    renderAddons();
    renderSimilar();
    initGiftAndFulfill();
    bindWishlistButton();
    initQty();
    initCart();
  }

  init();
})();

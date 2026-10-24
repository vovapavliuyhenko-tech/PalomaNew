/* ════════════════════════════════════════════════════════
   PALOMA CHECKOUT — полная логика
   Зависимости: cart-core.js (PalomaCart)
   ════════════════════════════════════════════════════════ */

(function PalomaCheckout() {
  "use strict";

  if (!document.body.classList.contains("checkout-page")) return;

  const CART_KEY = "paloma_cart_v3";
  const ORDER_KEY = "paloma_last_order";
  const DELIVERY_COST = 350;
  const FREE_DELIVERY = 7000;
  const CARD_COST = 0;

  const UPSELL_ITEMS = [
    {
      /* кнопки выбора: открывают панель снизу (openPicker) */
      id: "upsell-coffee",
      picker: "coffee",
      name: "Кофе PALOMA",
      price: 250,
      priceLabel: "от 250 ₽",
      ph: "linear-gradient(135deg,#d8c0a8,#a07848)",
      image: "images/paloma/catalog/upsell-coffee.jpg",
    },
    {
      /* Не товар, а кнопка выбора: открывает панель со всеми вазами каталога */
      id: "upsell-vase",
      picker: "vases",
      name: "Ваза для букета",
      price: 2000,
      priceLabel: "от 2 000 ₽",
      ph: "linear-gradient(135deg,#d8e8f0,#b8c8d8)",
      image: "images/paloma/catalog/upsell-vase.jpg",
    },
    {
      id: "upsell-secateurs",
      name: "Секатор",
      price: 1000,
      priceLabel: "1000 ₽",
      ph: "linear-gradient(135deg,#cdd2d0,#8a9690)",
      image: "images/paloma/catalog/upsell-secateurs.jpg",
    },
    {
      /* новый id: старая цена 190 ₽ зашита в сервере под «upsell-dessert» */
      id: "upsell-dessert-day",
      picker: "dessert",
      name: "Десерт дня",
      price: 250,
      priceLabel: "от 250 ₽",
      ph: "linear-gradient(135deg,#e8c8b8,#c09878)",
      image: "images/paloma/catalog/upsell-dessert.jpg",
    },
  ];

  const $grid = document.getElementById("coGrid");
  const $empty = document.getElementById("coEmpty");
  const $success = document.getElementById("coSuccess");
  const $items = document.getElementById("coItems");
  const $subtotal = document.getElementById("coSubtotal");
  const $deliveryTotal = document.getElementById("coDeliveryTotal");
  const $total = document.getElementById("coTotal");
  const $mobileTotal = document.getElementById("coMobileTotal");
  const $form = document.getElementById("coForm");
  const $upsellGrid = document.getElementById("coUpsellGrid");
  const $cardRow = document.getElementById("coCardRow");
  const $deliveryPrice = document.getElementById("coDeliveryPrice");
  const $mobileBar = document.getElementById("coMobileBar");

  function getCart() {
    if (window.PalomaCart?.getItems) {
      return window.PalomaCart.getItems();
    }
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function itemMedia(item) {
    if (item.image) {
      return `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`;
    }
    const bg = item.bg || item.ph || "linear-gradient(135deg,#f0e8d8,#e0d0b8)";
    return `<div class="co-item__photo-ph" style="background:${esc(bg)};width:100%;height:100%;"></div>`;
  }

  function itemMeta(item) {
    const parts = [];
    if (item.size && item.size !== "—") parts.push(esc(item.size));
    if (item.addons?.length) {
      parts.push(esc(item.addons.filter(Boolean).join(", ")));
    }
    return parts.length
      ? `<p class="co-item__meta">${parts.join(" · ")}</p>`
      : "";
  }

  function renderItems(cart) {
    if (!$items) return;
    $items.innerHTML = "";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "co-item";
      li.dataset.id = item.id;

      li.innerHTML = `
        <div class="co-item__photo">${itemMedia(item)}</div>
        <div class="co-item__info">
          <p class="co-item__name">${esc(item.name)}</p>
          ${itemMeta(item)}
          <div class="co-item__qty">
            <button type="button" class="co-item__qty-btn" data-action="dec" data-id="${esc(item.id)}"
                    aria-label="Уменьшить количество">−</button>
            <span class="co-item__qty-num">${item.qty || 1}</span>
            <button type="button" class="co-item__qty-btn" data-action="inc" data-id="${esc(item.id)}"
                    aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <div class="co-item__right">
          <span class="co-item__price">${((item.price || 0) * (item.qty || 1)).toLocaleString("ru-RU")} ₽</span>
          <button type="button" class="co-item__remove" data-action="remove" data-id="${esc(item.id)}"
                  aria-label="Удалить ${esc(item.name)} из заказа">Удалить</button>
          </div>
      `;
      $items.appendChild(li);
    });
  }

  function renderUpsell(cart) {
    if (!$upsellGrid) return;
    $upsellGrid.innerHTML = "";

    UPSELL_ITEMS.forEach((item) => {
      if (item.picker) {
        const picked = cart.some((c) => PICKERS[item.picker].inCart(c));
        const div = document.createElement("div");
        div.className = "co-upsell-card";
        div.innerHTML = `
          <div class="co-upsell-card__photo"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div>
          <div class="co-upsell-card__body">
            <p class="co-upsell-card__name">${esc(item.name)}</p>
            <p class="co-upsell-card__price">${esc(item.priceLabel)}</p>
            <button type="button" class="co-upsell-card__btn ${picked ? "is-picked" : ""}" data-picker="${esc(item.picker)}">
              ${picked ? "✓ Добавлено · ещё" : "Выбрать"}
            </button>
          </div>`;
        $upsellGrid.appendChild(div);
        return;
      }
      const inCart = cart.some((c) => c.id === item.id);
      const div = document.createElement("div");
      div.className = "co-upsell-card";

      const imgHtml = item.image
        ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`
        : `<div style="background:${esc(item.ph)};width:100%;height:100%;"></div>`;

      div.innerHTML = `
        <div class="co-upsell-card__photo">${imgHtml}</div>
        <div class="co-upsell-card__body">
          <p class="co-upsell-card__name">${esc(item.name)}</p>
          <p class="co-upsell-card__price">${esc(item.priceLabel)}</p>
          <button type="button" class="co-upsell-card__btn ${inCart ? "is-added" : ""}"
                  data-upsell-id="${esc(item.id)}"
                  ${inCart ? "disabled" : ""}>
            ${inCart ? "✓ Добавлено" : "Добавить"}
          </button>
        </div>
      `;
      $upsellGrid.appendChild(div);
    });
  }

  function getDeliveryType() {
    const checked = document.querySelector('[name="delivery_type"]:checked');
    return checked ? checked.value : "courier";
  }

  /* город доставки — Новороссийск или другой */
  function isNovorossiysk() {
    const city = document.getElementById("co-city");
    const val = (city ? city.value : "").trim().toLowerCase();
    if (!val) return true; /* пусто = по умолчанию Новороссийск */
    return val.indexOf("новоросс") !== -1;
  }

  /* расчёт стоимости и подписи доставки курьером
     — Новороссийск: от 7000 ₽ бесплатно, иначе 350 ₽
     — другой город: от 350 ₽ (уточняем при оформлении) */
  function courierDelivery(subtotal) {
    if (!isNovorossiysk()) {
      return { cost: DELIVERY_COST, label: "от 350 ₽" };
    }
    if (subtotal >= FREE_DELIVERY) {
      return { cost: 0, label: "Бесплатно" };
    }
    return { cost: DELIVERY_COST, label: "350 ₽" };
  }

  function hasCard() {
    const cb = document.getElementById("co-add-card");
    return cb && cb.checked;
  }

  function calcTotals(cart) {
    const subtotal = cart.reduce(
      (s, i) => s + (i.price || 0) * (i.qty || 1),
      0,
    );
    const deliveryType = getDeliveryType();
    /* сертификат свадебной копилки — нематериальный, доставка не нужна;
       если в заказе нет физических товаров — доставка отсутствует */
    const hasPhysical = cart.some(
      (i) =>
        i.type !== "wedding-piggy" &&
        !String(i.id).startsWith("paloma-wedding-piggy"),
    );
    const courier = courierDelivery(subtotal);
    const delivery =
      !hasPhysical
        ? 0
        : deliveryType === "pickup" || deliveryType === "ask_recipient"
          ? 0
          : courier.cost;
    const cardCost = hasCard() ? CARD_COST : 0;
    const total = subtotal + delivery + cardCost;

    /* строку «Доставка» прячем полностью при самовывозе (доставки нет вообще)
       и для заказов без физических товаров.
       (inline display — атрибут hidden перебивается классом display:flex) */
    const deliveryRow = document.getElementById("coDeliveryRow");
    if (deliveryRow) {
      const hideDelivery = !hasPhysical || deliveryType === "pickup";
      deliveryRow.style.display = hideDelivery ? "none" : "";
    }

    if ($subtotal) {
      $subtotal.textContent = subtotal.toLocaleString("ru-RU") + " ₽";
    }
    if ($deliveryTotal) {
      $deliveryTotal.textContent =
        deliveryType === "pickup" || deliveryType === "ask_recipient"
          ? "Бесплатно"
          : courier.label;
    }
    /* цена на карточке «Курьер» — синхронно при любом пересчёте суммы */
    if ($deliveryPrice) $deliveryPrice.textContent = courier.label;
    if ($total) $total.textContent = total.toLocaleString("ru-RU") + " ₽";
    if ($mobileTotal) {
      $mobileTotal.textContent = total.toLocaleString("ru-RU") + " ₽";
    }
    if ($cardRow) $cardRow.hidden = !hasCard();

    return { subtotal, delivery, cardCost, total };
  }

  function updateView() {
    const cart = getCart();
    const empty = cart.length === 0;

    if ($grid) $grid.hidden = empty;
    if ($empty) $empty.hidden = !empty;
    if ($success) $success.hidden = true;
    if ($mobileBar) $mobileBar.hidden = empty;

    const $subNotice = document.getElementById("coSubNotice");
    if ($subNotice) {
      const hasSubscription = cart.some(
        (it) =>
          it.type === "subscription" ||
          String(it.id).startsWith("paloma-flower-subscription")
      );
      $subNotice.hidden = !hasSubscription;
    }

    if (!empty) {
      renderItems(cart);
      renderUpsell(cart);
      calcTotals(cart);
    }
  }

  /* ── Ограничение времени доставки ─────────────────────────────
     Нельзя выбрать интервал/время, которое уже прошло. Для доставки
     СЕГОДНЯ конец интервала (или точное время) должен быть минимум
     на час позже текущего момента: интервал 09:00–12:00 можно заказать
     не позже 11:00. Для будущих дат ограничений нет. */
  const LEAD_MIN = 60;
  function todayStr() {
    return new Date().toISOString().split("T")[0];
  }
  function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function hmToMin(hm) {
    const p = String(hm || "").split(":");
    return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
  }

  function updateTimeConstraints() {
    const dateInput = document.getElementById("co-date");
    const fromSel = document.getElementById("co-time-from");
    const toSel = document.getElementById("co-time-to");
    const exact = document.getElementById("co-exact-time");
    const isToday = !!dateInput && dateInput.value === todayStr();
    const cutoff = nowMinutes() + LEAD_MIN; /* конец интервала должен быть ≥ cutoff */

    if (toSel) {
      [...toSel.options].forEach((o) => {
        o.disabled = isToday && hmToMin(o.value) < cutoff;
      });
      if (toSel.selectedOptions[0] && toSel.selectedOptions[0].disabled) {
        const ok = [...toSel.options].find((o) => !o.disabled);
        if (ok) toSel.value = ok.value;
      }
    }
    if (fromSel && toSel) {
      const toMin = hmToMin(toSel.value);
      [...fromSel.options].forEach((o) => {
        o.disabled = hmToMin(o.value) >= toMin;
      });
      if (fromSel.selectedOptions[0] && fromSel.selectedOptions[0].disabled) {
        const ok = [...fromSel.options].find((o) => !o.disabled);
        if (ok) fromSel.value = ok.value;
      }
    }
    /* точное время — список: гасим прошедшие получасовки, а не min= на input,
       иначе браузеры всё равно дают ввести любое значение вручную */
    if (exact && exact.options) {
      [...exact.options].forEach((o) => {
        o.disabled = isToday && hmToMin(o.value) < cutoff;
      });
      if (exact.selectedOptions[0] && exact.selectedOptions[0].disabled) {
        const ok = [...exact.options].find((o) => !o.disabled);
        exact.value = ok ? ok.value : "";
      }
    }
    refreshPickers();
  }

  /* true, если выбранное время доставки ещё не прошло (или дата не сегодня) */
  function isDeliveryTimeValid() {
    const dt = getDeliveryType();
    /* Самовывоз и «узнать у получателя» идут без даты: в первом случае
       её нет, во втором её выясняет менеджер. Поля скрыты, и проверять
       в них нечего — иначе форма молча не отправлялась бы. */
    if (dt === "pickup" || dt === "ask_recipient") return true;
    const dateInput = document.getElementById("co-date");
    if (!dateInput || dateInput.value !== todayStr()) return true;
    const cutoff = nowMinutes() + LEAD_MIN;
    const timeType = document.querySelector('[name="time_type"]:checked');
    if (timeType && timeType.value === "exact") {
      const ex = document.getElementById("co-exact-time");
      return !!ex && ex.value !== "" && hmToMin(ex.value) >= cutoff;
    }
    const to = document.getElementById("co-time-to");
    return !!to && to.value !== "" && hmToMin(to.value) >= cutoff;
  }

  function handleDeliveryToggle() {
    const type = getDeliveryType();
    const $addrFields = document.getElementById("coAddressFields");
    if ($addrFields) {
      $addrFields.hidden = type !== "courier";
    }

    /* «Узнать у получателя» — дату и время согласует менеджер напрямую с
       получателем, поэтому спрашивать их у отправителя незачем: он их
       попросту не знает. Блок убираем целиком, а не оставляем пустым. */
    const $dateTime = document.getElementById("coDateTimeFields");
    if ($dateTime) {
      $dateTime.hidden = type === "ask_recipient";
    }

    /* Самовывоз — оплата только в студии, онлайн-оплату убираем.
       Если она была выбрана — возвращаем «Оплата при получении». */
    const $onlinePay = document.getElementById("coOnlinePayOption");
    if ($onlinePay) {
      const isPickup = type === "pickup";
      $onlinePay.style.display = isPickup ? "none" : "";
      const onlineRadio = $onlinePay.querySelector('input[name="payment"]');
      if (isPickup && onlineRadio && onlineRadio.checked) {
        const receipt = document.querySelector(
          'input[name="payment"][value="payment_on_receipt"]',
        );
        if (receipt) receipt.checked = true;
      }
    }
    if ($deliveryPrice) {
      const cart = getCart();
      const subtotal = cart.reduce(
        (s, i) => s + (i.price || 0) * (i.qty || 1),
        0,
      );
      $deliveryPrice.textContent = courierDelivery(subtotal).label;
    }
    calcTotals(getCart());
  }

  function cartAction(id, action) {
    if (!window.PalomaCart) return;
    if (action === "inc") window.PalomaCart.bumpQtyById(id, 1);
    else if (action === "dec") window.PalomaCart.bumpQtyById(id, -1);
    else if (action === "remove") window.PalomaCart.removeById(id);
    updateView();
  }

  /* ── Панель выбора снизу: вазы, кофе, десерты ────────────────────────
     Клиент листает варианты, не уходя со страницы заказа: «Добавить» кладёт
     позицию в корзину и закрывает панель; крестик, фон или Esc — просто
     закрыть. Вазы берём из каталога, кофе и десерты — из меню кофейни. */
  function loadScript(src) {
    return new Promise((resolve) => {
      const el = document.createElement("script");
      el.src = src;
      el.onload = () => resolve(true);
      el.onerror = () => resolve(false);
      document.head.appendChild(el);
    });
  }

  function loadCatalog() {
    if (Array.isArray(window.PALOMA_PRODUCTS) && window.PALOMA_PRODUCTS.length) {
      return Promise.resolve(window.PALOMA_PRODUCTS);
    }
    const fromServer = window.palomaFetch
      ? window.palomaFetch("?a=products", { cache: "no-store" }).then((r) => r.json()).then((d) => d && d.products)
      : Promise.reject(new Error("нет сервера"));
    return fromServer
      .then((l) => { if (!Array.isArray(l) || !l.length) throw new Error("пусто"); return l; })
      /* сервер молчит — берём запасной каталог с сайта */
      .catch(() => loadScript("paloma-products.js?v=p63").then(() => window.PALOMA_PRODUCTS || []));
  }

  function loadMenu() {
    if (Array.isArray(window.PALOMA_COFFEE_MENU)) return Promise.resolve(window.PALOMA_COFFEE_MENU);
    return loadScript("coffee-menu-data.js?v=27").then(() => window.PALOMA_COFFEE_MENU || []);
  }

  /* «220 / 270 / 300 ₽» + «250 / 350 / 450 мл» → размеры (как в меню кофейни) */
  function menuSizes(it) {
    const vols = String(it.volumes || "").split("/").map((x) => x.trim()).filter(Boolean);
    const nums = String(it.priceLabel || "").split("/")
      .map((x) => parseInt(x.replace(/[^0-9]/g, ""), 10) || 0);
    if (nums.length > 1 && (vols.length === nums.length || !vols.length)) {
      const unit = (String(it.volumes || "").match(/[^\d\s/]+\s*$/) || [""])[0].trim();
      return nums.map((pr, i) => {
        let v = vols[i] || "";
        if (v && /^\d+$/.test(v) && unit) v += " " + unit;
        return { label: v, price: pr, suffix: "-" + (i + 1) };
      });
    }
    return [{ label: vols[0] || "", price: Number(it.price) || nums[0] || 0, suffix: "" }];
  }

  const MENU_IMG = {
    classic: "images/paloma/coffee/cup-classic.jpg",
    cacaoraf: "images/paloma/coffee/cup-raf.jpg",
    milkshake: "images/paloma/coffee/cup-milkshake.jpg",
    tea: "images/paloma/coffee/cup-tea.jpg",
    cold: "images/paloma/coffee/cup-cold.jpg",
  };
  const MENU_CATS = {
    classic: "Классика", cacaoraf: "Какао и раф", cold: "Холодные",
    milkshake: "Коктейли", tea: "Чай", dessert: "Десерты", corpus: "Корпусные",
  };

  function menuPicker(cats, rows) {
    return {
      rows: !!rows, /* без фото — аккуратным списком */
      inCart: (c) => c.category === "coffee" && cats.some((k) => String(c.id).indexOf("menu-" + k + "-") === 0),
      load: () => loadMenu().then((m) => m
        .filter((it) => cats.indexOf(it.category) >= 0 && Number(it.price) > 0)
        .sort((a, b) => cats.indexOf(a.category) - cats.indexOf(b.category))
        .map((it) => ({
          group: MENU_CATS[it.category] || "",
          name: it.title,
          image: rows ? "" : it.image || MENU_IMG[it.category] || "",
          bg: it.imageBg || "",
          sizes: menuSizes(it),
          toCart: (sz) => ({
            id: it.id + (sz.suffix || ""),
            name: it.title + (sz.label ? " · " + sz.label : ""),
            price: sz.price,
            qty: 1,
            category: "coffee",
          }),
        }))),
    };
  }

  const PICKERS = {
    vases: {
      title: "Выберите вазу",
      inCart: (c) => c.category === "vases",
      load: () => loadCatalog().then((list) => (Array.isArray(list) ? list : [])
        /* в «Вазах и подарках» есть ещё посуда, свечи и шоколад */
        .filter((p) => p && Number(p.price) > 0 && (p.categories || [p.category]).indexOf("vases") >= 0 && /ваз/i.test(p.name))
        .sort((a, b) => a.price - b.price)
        .map((p) => ({
          name: p.name,
          image: p.image || "",
          sizes: [{ label: "", price: Number(p.price), suffix: "" }],
          toCart: () => ({
            id: p.id + "-quick-one-" + p.price,
            name: p.name, size: "", addons: [],
            price: Number(p.price), qty: 1,
            image: p.image || "", category: "vases",
          }),
        }))),
    },
    coffee: Object.assign({ title: "Выберите напиток" }, menuPicker(["classic", "cacaoraf", "cold", "milkshake", "tea"])),
    dessert: Object.assign({ title: "Выберите десерт" }, menuPicker(["dessert", "corpus"], true)),
  };

  function money(n) { return Number(n).toLocaleString("ru-RU") + " ₽"; }

  function closePicker() {
    const box = document.getElementById("coPickSheet");
    if (!box) return;
    box.classList.remove("is-open");
    document.documentElement.classList.remove("co-sheet-lock");
    setTimeout(() => box.remove(), 260);
    document.removeEventListener("keydown", onSheetKey);
  }
  function onSheetKey(e) { if (e.key === "Escape") closePicker(); }

  function openPicker(kind) {
    const P = PICKERS[kind];
    if (!P || document.getElementById("coPickSheet")) return;
    let options = [];
    const box = document.createElement("div");
    box.id = "coPickSheet";
    box.className = "co-sheet";
    box.innerHTML = `
      <div class="co-sheet__backdrop" data-sheet-close></div>
      <div class="co-sheet__panel" role="dialog" aria-modal="true" aria-label="${esc(P.title)}">
        <div class="co-sheet__head">
          <span class="co-sheet__grip" aria-hidden="true"></span>
          <p class="co-sheet__title">${esc(P.title)}</p>
          <button type="button" class="co-sheet__close" data-sheet-close aria-label="Закрыть">×</button>
        </div>
        <div class="co-sheet__body"><p class="co-sheet__msg">Загружаем…</p></div>
      </div>`;
    document.body.appendChild(box);
    document.documentElement.classList.add("co-sheet-lock");
    void box.offsetWidth; /* зафиксировать стартовое положение, чтобы панель выехала плавно */
    box.classList.add("is-open");
    document.addEventListener("keydown", onSheetKey);

    box.addEventListener("click", (e) => {
      if (e.target.closest("[data-sheet-close]")) { closePicker(); return; }
      const card = e.target.closest(".co-sheet-card");
      const o = card && options[+card.dataset.i];
      if (!o) return;
      const sizeBtn = e.target.closest("[data-size-btn]");
      if (sizeBtn) {
        card.dataset.size = sizeBtn.dataset.sizeBtn;
        card.querySelectorAll("[data-size-btn]").forEach((b) => b.classList.toggle("is-on", b === sizeBtn));
        card.querySelector(".co-sheet-card__price").textContent = money(o.sizes[+sizeBtn.dataset.sizeBtn].price);
        return;
      }
      const add = e.target.closest("[data-add]");
      if (!add) return;
      window.PalomaCart?.add?.(o.toCart(o.sizes[+(card.dataset.size || 0)]));
      add.textContent = "✓ Добавлено";
      add.classList.add("is-added");
      updateView();
      setTimeout(closePicker, 450);
    });

    const body = box.querySelector(".co-sheet__body");
    P.load().then((list) => {
      options = list || [];
      if (!options.length) {
        body.innerHTML = '<p class="co-sheet__msg">Не удалось загрузить. Попробуйте ещё раз чуть позже.</p>';
        return;
      }
      let html = "";
      let group = null;
      options.forEach((o, i) => {
        const g = o.group || "";
        if (g !== group) {
          if (group !== null) html += "</div>";
          if (g) html += `<p class="co-sheet__group">${esc(g)}</p>`;
          html += P.rows ? '<div class="co-sheet__list">' : '<div class="co-sheet__grid">';
          group = g;
        }
        const photo = o.image
          ? `<img src="${esc(o.image)}" alt="${esc(o.name)}" loading="lazy">`
          : `<span class="co-sheet-card__ph" style="background:${esc(o.bg || "#f6f3ef")}"></span>`;
        const sizes = o.sizes.length > 1
          ? '<div class="co-sheet-card__sizes">' + o.sizes.map((sz, k) =>
              `<button type="button" class="co-sheet-size${k ? "" : " is-on"}" data-size-btn="${k}">${esc(sz.label || "№" + (k + 1))}</button>`).join("") + "</div>"
          : "";
        if (P.rows) {
          html += `
          <div class="co-sheet-card co-sheet-card--row" data-i="${i}">
            <div class="co-sheet-card__info">
              <p class="co-sheet-card__name">${esc(o.name)}</p>
              ${sizes}
            </div>
            <p class="co-sheet-card__price">${money(o.sizes[0].price)}</p>
            <button type="button" class="co-upsell-card__btn" data-add aria-label="Добавить ${esc(o.name)}">Добавить</button>
          </div>`;
          return;
        }
        html += `
          <div class="co-sheet-card" data-i="${i}">
            <div class="co-sheet-card__photo">${photo}</div>
            <p class="co-sheet-card__name">${esc(o.name)}</p>
            ${sizes}
            <p class="co-sheet-card__price">${money(o.sizes[0].price)}</p>
            <button type="button" class="co-upsell-card__btn" data-add>Добавить</button>
          </div>`;
      });
      body.innerHTML = html + "</div>";
    });
  }

  function addUpsell(id) {
    const item = UPSELL_ITEMS.find((u) => u.id === id);
    const cart = getCart();
    if (!item || cart.some((c) => c.id === id)) return;

    const payload = {
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      bg: item.ph,
      image: item.image,
      category: "upsell",
    };

    if (window.PalomaCart?.add) {
      window.PalomaCart.add(payload);
      window.PalomaCart.closeDrawer?.();
    } else {
      cart.push(payload);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    updateView();
  }

  document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(
      '[data-action="inc"], [data-action="dec"], [data-action="remove"]',
    );
    if (qtyBtn && $items?.contains(qtyBtn)) {
      cartAction(qtyBtn.dataset.id, qtyBtn.dataset.action);
      return;
    }

    const pickerBtn = e.target.closest("[data-picker]");
    if (pickerBtn && $upsellGrid?.contains(pickerBtn)) {
      openPicker(pickerBtn.dataset.picker);
      return;
    }

    const upsellBtn = e.target.closest("[data-upsell-id]");
    if (upsellBtn) {
      addUpsell(upsellBtn.dataset.upsellId);
      return;
    }

    if (
      e.target.closest("#coSubmitBtn, #coMobileSubmit, #coSubmitMobile")
    ) {
      e.preventDefault();
      handleSubmit();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.name === "delivery_type") {
      handleDeliveryToggle();
    }
    if (e.target.dataset.action === "toggle-recipient") {
      const fields = document.getElementById("coRecipientFields");
      if (fields) fields.hidden = e.target.value !== "other";
    }
    if (e.target.name === "time_type") {
      const interval = document.getElementById("coTimeInterval");
      const exact = document.getElementById("coTimeExact");
      const toExact = e.target.value === "exact";
      if (interval) interval.hidden = toExact;
      if (exact) exact.hidden = !toExact;
      /* Гасим поля скрытого режима. Иначе в заказе оставались ОБА времени —
         и точное, и интервал, — а разные части кода читали разные поля. */
      if (toExact) {
        const from = document.getElementById("co-time-from");
        const to = document.getElementById("co-time-to");
        if (from) from.value = "";
        if (to) to.value = "";
      } else {
        const ex = document.getElementById("co-exact-time");
        if (ex) ex.value = "";
      }
      updateTimeConstraints();
    }
    if (
      e.target.id === "co-date" ||
      e.target.id === "co-time-from" ||
      e.target.id === "co-time-to" ||
      e.target.id === "co-exact-time"
    ) {
      updateTimeConstraints();
      const te = document.getElementById("co-time-error");
      if (te && isDeliveryTimeValid()) te.hidden = true;
    }
    if (e.target.id === "co-add-card") {
      const tf = document.getElementById("coCardTextField");
      if (tf) tf.hidden = !e.target.checked;
      calcTotals(getCart());
    }
    if (e.target.id === "co-consent") {
      syncConsentGate();
    }
  });

  /* пересчёт доставки при вводе города */
  document.addEventListener("input", (e) => {
    if (e.target.id === "co-city") {
      handleDeliveryToggle();
    }
  });

  /* Раньше кнопка оформления стояла отключённой, пока не отмечено согласие.
     Кто не замечал галочку — видел мёртвую кнопку без единого слова о том,
     почему она не работает, и уходил. Теперь кнопка живая: по нажатию
     validateForm показывает, чего не хватает, и страница прокручивается к
     этому месту. Отправить заказ без согласия по-прежнему нельзя — проверка
     на месте, изменился только способ об этом сказать. */
  function syncConsentGate() {
    const consent = document.getElementById("co-consent");
    const err = document.getElementById("co-consent-error");
    if (err && consent && consent.checked) err.hidden = true;
  }
  syncConsentGate();

  $form?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  document.addEventListener("paloma-cart-updated", updateView);

  const ALLOWED_PAYMENTS = ["payment_on_receipt", "online", "split"];
  let submitting = false;

  /* показать поле выбранного мессенджера, скрыть остальные */
  function updateMessengerFields() {
    const sel = document.querySelector('[name="messenger"]:checked')?.value;
    document.querySelectorAll("[data-messenger-field]").forEach((f) => {
      f.hidden = f.getAttribute("data-messenger-field") !== sel;
    });
  }
  document.querySelectorAll("[data-messenger]").forEach((r) =>
    r.addEventListener("change", () => {
      updateMessengerFields();
      const me = document.getElementById("co-messenger-error");
      if (me) me.hidden = true;
    }),
  );

  /* нормализация + валидация контакта; серверного пересчёта нет (статика) */
  function normContact(kind, raw) {
    const v = (raw || "").trim();
    const digits = v.replace(/\D/g, "");
    const isPhone = /^\+?\d[\d\s()\-]{8,}$/.test(v);
    /* Звонок: отдельного поля нет, берём телефон из шапки формы. Он
       обязателен и уже проверен своим правилом, так что здесь только
       приводим к единому виду. */
    if (kind === "call") {
      const phone = (document.getElementById("co-phone")?.value || "").replace(/\D/g, "");
      return phone.length >= 10 ? { ok: true, value: "+" + phone } : { ok: false };
    }
    if (kind === "telegram") {
      if (isPhone && digits.length >= 10) return { ok: true, value: "+" + digits };
      const u = v.replace(/^@/, "");
      if (/^[A-Za-z0-9_]{5,32}$/.test(u)) return { ok: true, value: "@" + u };
      return { ok: false };
    }
    if (kind === "whatsapp") {
      if (digits.length >= 10 && digits.length <= 15) return { ok: true, value: "+" + digits };
      return { ok: false };
    }
    if (kind === "max") {
      if (isPhone && digits.length >= 10) return { ok: true, value: "+" + digits };
      if (v.replace(/^@/, "").length >= 3) return { ok: true, value: "@" + v.replace(/^@/, "") };
      return { ok: false };
    }
    return { ok: false };
  }

  function validateForm() {
    let valid = true;

    const rules = [
      {
        id: "co-name",
        errorId: "co-name-error",
        check: (v) => v.trim().length >= 2,
      },
      {
        id: "co-phone",
        errorId: "co-phone-error",
        check: (v) => v.replace(/\D/g, "").length >= 10,
      },
      {
        id: "co-date",
        errorId: "co-date-error",
        check: (v) => v.trim() !== "",
        skip: () => {
          const dt = getDeliveryType();
          return dt === "pickup" || dt === "ask_recipient";
        },
      },
    ];

    rules.forEach((rule) => {
      if (rule.skip && rule.skip()) return;
      const input = document.getElementById(rule.id);
      const error = document.getElementById(rule.errorId);
      if (!input) return;
      const ok = rule.check(input.value);
      input.classList.toggle("is-error", !ok);
      if (error) error.hidden = ok;
      if (!ok) valid = false;
    });

    if (getDeliveryType() === "courier") {
      const addrInput = document.getElementById("co-address");
      if (addrInput && addrInput.value.trim().length < 5) {
        addrInput.classList.add("is-error");
      valid = false;
      } else if (addrInput) {
        addrInput.classList.remove("is-error");
      }
    }

    /* время доставки не должно быть уже прошедшим (для сегодняшней даты) */
    const timeErr = document.getElementById("co-time-error");
    const timeOk = isDeliveryTimeValid();
    if (timeErr) timeErr.hidden = timeOk;
    if (!timeOk) valid = false;

    const recipientType = document.querySelector(
      '[name="recipient_type"]:checked',
    )?.value;
    if (recipientType === "other") {
      const recName = document.getElementById("co-recipient-name");
      if (recName && recName.value.trim().length < 2) {
        recName.classList.add("is-error");
      valid = false;
      } else if (recName) {
        recName.classList.remove("is-error");
      }
    }

    /* мессенджер: выбран + валидный контакт (только видимое поле обязательно) */
    const messenger = document.querySelector('[name="messenger"]:checked')?.value;
    const mErr = document.getElementById("co-messenger-error");
    if (!messenger) {
      if (mErr) mErr.hidden = false;
      valid = false;
    } else if (messenger !== "call") {
      /* У звонка своего поля нет — телефон проверяется правилом выше,
         второй раз спрашивать и проверять нечего. */
      if (mErr) mErr.hidden = true;
      const input = document.getElementById("co-msg-" + messenger);
      const fErr = document.getElementById("co-msg-" + messenger + "-error");
      const res = normContact(messenger, input?.value);
      if (input) input.classList.toggle("is-error", !res.ok);
      if (fErr) fErr.hidden = res.ok;
      if (!res.ok) valid = false;
    } else if (mErr) {
      mErr.hidden = true;
    }

    /* согласие на обработку ПДн */
    const consent = document.getElementById("co-consent");
    const cErr = document.getElementById("co-consent-error");
    if (consent && !consent.checked) {
      if (cErr) cErr.hidden = false;
      valid = false;
    } else if (cErr) {
      cErr.hidden = true;
    }

    return valid;
  }

  function collectFormData() {
    const data = {};
    if ($form) {
      new FormData($form).forEach((v, k) => {
        data[k] = v;
      });
    }
    const payment = document.querySelector('[name="payment"]:checked');
    if (payment) data.payment = payment.value;
    return data;
  }

  /* Доставка отдельными полями — для CRM в админке. В managerText то же самое
     есть, но строкой: по строке нельзя ни отфильтровать заказы на завтра,
     ни отсортировать по дате. */
  function deliveryInfo(orderData) {
    const f = (orderData && orderData.form) || {};
    const exact = f.time_type === "exact";
    return {
      type: f.delivery_type || "",
      date: f.delivery_date || "",
      time: exact
        ? f.exact_time || ""
        : [f.time_from, f.time_to].filter(Boolean).join("–"),
      timeType: f.time_type || "",
      address:
        f.delivery_type === "pickup"
          ? "Самовывоз · ул. Энгельса, 74/82"
          : [f.city, f.address, f.apt].filter(Boolean).join(", "),
      courierNote: f.courier_note || "",
      recipient: f.recipient_type === "other" ? f.recipient_name || "" : "",
      recipientPhone: f.recipient_type === "other" ? f.recipient_phone || "" : "",
      comment: f.comment || "",
      /* Открытка — отдельным полем, чтобы в CRM её было видно сразу
         в карточке, а не только внутри «Полного текста заказа». */
      card: f.add_card ? String(f.card_text || "").trim() || "(без текста)" : "",
    };
  }

  async function handleSubmit() {
    if (submitting) return; /* защита от двойного клика/повторной отправки */
    const cart = getCart();
    if (!cart.length) {
      updateView();
      return;
    }

    if (!validateForm()) {
      const firstError = document.querySelector(
        ".is-error, .co-error:not([hidden])",
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    /* Цель: контактные данные заполнены и прошли валидацию. */
    if (window.palomaGoal) window.palomaGoal("checkout_contacts");

    submitting = true;
    [
      document.getElementById("coSubmitBtn"),
      document.getElementById("coSubmitMobile"),
    ].forEach((b) => {
      if (b) {
        /* Подпись возвращаем в releaseSubmit, поэтому запоминаем исходную */
        if (!b.dataset.label) b.dataset.label = b.textContent.trim();
        b.textContent = "Отправляем заказ…";
        b.classList.remove("is-nudge");
        b.disabled = true;
        b.setAttribute("aria-busy", "true");
      }
    });

    const totals = calcTotals(cart);
    /* оплата — только из allowlist, не доверяем произвольному value */
    const payEl = document.querySelector('[name="payment"]:checked');
    const payment = ALLOWED_PAYMENTS.includes(payEl?.value)
      ? payEl.value
      : ALLOWED_PAYMENTS[0];
    /* Номер заказа Сплита — с префиксом SPL-: по нему сервер знает, что статус
       оплаты спрашивать у Яндекс Пэй, а не у PayKeeper. */
    const orderId = (payment === "split" ? "SPL-" : "ORD-") + Date.now().toString(36).toUpperCase();

    const messenger = document.querySelector('[name="messenger"]:checked')?.value;
    const rawContact = document.getElementById("co-msg-" + messenger)?.value || "";
    const messengerContact = normContact(messenger, rawContact).value || "";

    const orderData = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart.slice(),
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      cardCost: totals.cardCost,
      total: totals.total,
      payment,
      messenger,
      messengerContact,
      consent: true,
      preliminary: true,
      status: "new_awaiting_manager",
      form: collectFormData(),
    };

    /* Онлайн-заказ уходит менеджеру только после оплаты (со страницы thank-you).
       Сохраняем готовый текст заказа, чтобы thank-you отправил его без пересборки. */
    orderData.managerText = buildManagerText(orderData);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(orderData));
    } catch {
      /* ignore */
    }

    /* Онлайн-оплата: корзину не трогаем — вдруг покупатель откажется
       на странице Яндекс Пэй. Её очистит thank-you.html после оплаты.
       Онлайн-заказ уходит менеджеру внутри initPayment (createInvoice). */
    if (payment === "online" && payEndpoint()) {
      initPayment(orderData);
      return;
    }
    if (payment === "split" && splitEndpoint()) {
      initPayment(orderData, true);
      return;
    }

    /* Заказ «при получении» через функцию не проходит — уведомляем бот
       отдельно, чтобы в него попадали АБСОЛЮТНО ВСЕ заказы.
       ЖДЁМ отправку перед переходом: на мобильных браузерах «fire-and-forget»
       fetch часто обрывается при немедленном переходе на thank-you, и заказ
       не долетал до бота. Ограничиваем ожидание 6с, чтобы не держать клиента. */
    const delivered = await notifyManagerOfOrder(orderData);
    if (!delivered) await offerMessengerFallback(orderData);

    emptyCart();
    showSuccess(orderId);
  }

  /* Уведомление менеджеру для заказов без онлайн-оплаты. Возвращает промис,
     который резолвится по завершении отправки ИЛИ через 6с (что раньше) —
     чтобы гарантированно успеть отправить до перехода на thank-you.
     keepalive: true — подстраховка, если всё же уйдём по таймауту. */
  function notifyManagerOfOrder(orderData, extra) {
    const ep = payEndpoint();
    if (!ep) return Promise.resolve();
    const f = orderData.form || {};
    /* extra — для заказа, где онлайн-оплата не создалась: свой заголовок
       и объяснение менеджеру. Обычный заказ идёт как раньше. */
    const x = extra || {};
    const managerText = [x.header, x.note, buildManagerText(orderData)]
      .filter(Boolean)
      .join("\n\n");
    const send = window.palomaFetch("?a=notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        orderId: orderData.id,
        /* payment_failed — чтобы сервер не пошёл по ветке online_paid
           (там заказ ищется в pending_orders, которого нет). */
        payment: x.header ? "payment_failed" : orderData.payment,
        items: orderData.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty || 1,
        })),
        delivery: orderData.delivery,
        deliveryInfo: deliveryInfo(orderData),
        clientName: f.name || "",
        phone: f.phone || "",
        messengerContact: orderData.messengerContact || "",
        managerText: managerText,
      }),
    }).then((r) => !!(r && r.ok)).catch(() => false); /* уведомление не должно мешать оформлению заказа */
    /* true — сервер подтвердил приём; false — не ответил за 8 с или ошибка
       (например, сбой облака). Тогда заказ отдаём клиенту в мессенджер. */
    return Promise.race([
      send,
      new Promise((resolve) => setTimeout(() => resolve(false), 24000)),
    ]);
  }

  /* ── Запасной путь: сервер недоступен (сбой облака) ──
     Заказ НЕ теряем и не говорим «принят», пока он не дошёл: показываем
     готовый текст заказа и кнопки отправить его в WhatsApp / Telegram
     или позвонить. */
  function offerMessengerFallback(orderData) {
    return new Promise((resolve) => {
      const text = (orderData.managerText || buildManagerText(orderData)).slice(0, 3500);
      const wa = "https://wa.me/79897707000?text=" +
        encodeURIComponent("Здравствуйте! Хочу оформить заказ:\n\n" + text);
      const btn = "display:block;text-align:center;border-radius:12px;padding:12px;margin-bottom:8px;text-decoration:none;font-weight:600;";
      const box = document.createElement("div");
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(27,26,24,.55);" +
        "display:flex;align-items:center;justify-content:center;padding:16px";
      box.innerHTML =
        '<div style="background:#fff;border-radius:18px;max-width:420px;width:100%;padding:22px 20px;' +
          'font:14px/1.5 Montserrat,Arial,sans-serif;color:#1B1A18;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
        '<div style="font-size:17px;font-weight:600;margin-bottom:8px">Заказ почти оформлен</div>' +
        '<div style="font-size:13px;color:#555;margin-bottom:16px">Сервер заказов сейчас не отвечает. ' +
          'Чтобы заказ точно дошёл, отправьте его нам в мессенджер — текст заказа уже готов. Или просто позвоните.</div>' +
        '<a data-k="wa" href="' + wa + '" target="_blank" rel="noopener" style="' + btn + 'background:#25D366;color:#fff">Отправить в WhatsApp</a>' +
        '<a data-k="tg" href="https://t.me/palomanvrsk" target="_blank" rel="noopener" style="' + btn + 'background:#2AABEE;color:#fff">Скопировать заказ и открыть Telegram</a>' +
        '<a href="tel:+79897707000" style="' + btn + 'border:1px solid #1B1A18;color:#1B1A18;margin-bottom:12px">Позвонить +7 989 770-70-00</a>' +
        '<button type="button" data-k="done" style="display:block;width:100%;background:none;border:0;color:#888;' +
          'font:inherit;font-size:12px;text-decoration:underline;cursor:pointer">Я отправил(а) заказ</button>' +
        "</div>";
      document.body.appendChild(box);
      box.querySelector('[data-k="tg"]').addEventListener("click", () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* ок */ }
      });
      box.querySelector('[data-k="done"]').addEventListener("click", () => { box.remove(); resolve(); });
    });
  }

  function emptyCart() {
    if (window.PalomaCart?.emptyCart) {
      window.PalomaCart.emptyCart();
    } else {
      localStorage.removeItem(CART_KEY);
    }
  }

  function showSuccess(orderId) {
    /* заказ уже сохранён в paloma_last_order — уходим на отдельную
       страницу успеха; повторное открытие/обновление заказ не создаёт */
    void orderId;
    window.location.href = "thank-you.html";
  }

  function payEndpoint() {
    return (window.PALOMA_PAYMENT_CONFIG?.PAYMENT_ENDPOINT || "").trim();
  }

  function releaseSubmit() {
    submitting = false;
    [
      document.getElementById("coSubmitBtn"),
      document.getElementById("coSubmitMobile"),
    ].forEach((b) => {
      if (b) {
        if (b.dataset.label) b.textContent = b.dataset.label;
        b.disabled = false;
        b.removeAttribute("aria-busy");
      }
    });
    armNudge();
  }

  /* ── Кнопка «дышит», если человек застыл ──────────────────
     Не сразу: сначала даём спокойно заполнить форму. Через паузу
     без единого действия кнопка делает четыре вдоха и замолкает —
     любое касание клавиатуры или экрана сбрасывает отсчёт заново. */
  function nudgeButtons() {
    return [
      document.getElementById("coSubmitBtn"),
      document.getElementById("coSubmitMobile"),
    ].filter(Boolean);
  }

  /* Кнопка привлекает внимание всё время, пока человек на странице: так
     решил владелец. Раньше анимация включалась через паузу бездействия и
     затихала после четырёх циклов — таймер убран, остаётся только снять
     класс на время отправки, чтобы «Отправляем заказ…» не переливалось. */
  function armNudge() {
    nudgeButtons().forEach((b) => {
      b.classList.toggle("is-nudge", !submitting && !b.disabled);
    });
  }
  armNudge();

  /* ── Стрелка «кнопка ниже» ────────────────────────────────
     Колонка сводки прокручивается сама (position: sticky + max-height),
     и на невысоком экране кнопка заказа уходит за её нижний край: человек
     упирается в выбор оплаты и думает, что дальше ничего нет.

     Показываем стрелку только когда колонка правда прокручивается и кнопки
     не видно. На узком экране колонка становится обычной (position: static),
     кнопка попадает в общий поток, а внизу и так висит липкая панель —
     подсказка там не нужна и не появится. */
  function initScrollHint() {
    const hint = document.getElementById("coScrollHint");
    const col = document.querySelector(".co-summary-col");
    const target = document.getElementById("coSubmitBtn");
    if (!hint || !col || !target) return;

    /* Считаем видимость сами, без IntersectionObserver: тот даёт первый
       ответ асинхронно, а сводка в начале скрыта (coGrid[hidden]) — на
       пустой колонке наблюдатель делал единственный вывод «прокрутки нет»
       и больше не просыпался. Прямой расчёт отрабатывает сразу и там, где
       нужно: при прокрутке, при смене размера и после отрисовки корзины. */
    function update() {
      if (col.scrollHeight <= col.clientHeight + 8) {
        hint.hidden = true;
        return;
      }
      const box = col.getBoundingClientRect();
      const btn = target.getBoundingClientRect();
      const visible = btn.top < box.bottom - 8 && btn.bottom > box.top + 8;
      hint.hidden = visible;
    }

    col.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("paloma-cart-updated", update);
    update();
    /* init() с первой отрисовкой корзины идёт ниже по файлу, так что этот
       расчёт пришёлся бы на ещё скрытую сводку — пересчитываем после неё. */
    requestAnimationFrame(update);

    hint.addEventListener("click", () => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return update;
  }
  const updateScrollHint = initScrollHint();

  /* Полный текст заказа для менеджера — уходит в функцию и оттуда в Telegram,
     чтобы менеджер получил детали даже если клиент не отправит их сам. */
  function money(n) {
    return (Number(n) || 0).toLocaleString("ru-RU") + " ₽";
  }
  function buildManagerText(o) {
    const f = o.form || {};
    const items = o.items
      .map((i, n) => {
        const opt = [];
        if (i.size && i.size !== "—" && i.category !== "coffee") opt.push(i.size);
        if (Array.isArray(i.addons)) opt.push(...i.addons.filter(Boolean));
        const suffix = opt.length ? " (" + opt.join(", ") + ")" : "";
        return `${n + 1}. ${i.name}${suffix} — ${i.qty || 1} шт. — ${money(i.price * (i.qty || 1))}`;
      })
      .join("\n");

    const fulfil =
      f.delivery_type === "pickup"
        ? "Самовывоз — ул. Энгельса, 74/82"
        : f.delivery_type === "ask_recipient"
          ? "Доставка — адрес уточнить у получателя"
          : "Доставка курьером";

    const lines = ["Состав:", items || "—", "", "Сумма: " + money(o.total), "", "Получение: " + fulfil];
    if (f.delivery_type === "courier") {
      const addr = [f.city, f.address, f.apt ? "кв. " + f.apt : ""].filter(Boolean).join(", ");
      if (addr) lines.push("Адрес: " + addr);
    }
    /* При «узнать у получателя» дату и время в текст не кладём: поля скрыты,
       и в них остаются значения по умолчанию (09:00–22:00). Менеджер принял
       бы их за выбор клиента и звонил бы согласовывать несуществующее время. */
    const askRecipient = f.delivery_type === "ask_recipient";
    if (askRecipient) {
      lines.push("Дату и время уточнить у получателя");
    } else {
      if (f.delivery_date) lines.push("Дата: " + f.delivery_date);
      /* Время доставки: точное («к 14:30») или интервал («09:00–12:00»). Раньше
         не попадало в текст заказа — менеджер не видел выбранное время. */
      const interval = f.time_from && f.time_to ? f.time_from + "–" + f.time_to : "";
      const exactAt = f.exact_time ? "к " + f.exact_time : "";
      /* Без time_type (старые заказы) берём то, что заполнено, — иначе строка
         со временем пропадала из сообщения менеджеру целиком. */
      const timeStr =
        f.time_type === "exact" ? exactAt
        : f.time_type === "interval" ? interval
        : (exactAt || interval);
      if (timeStr) lines.push("Время: " + timeStr);
    }
    if (f.recipient_type === "other") {
      lines.push("", "Получатель: " + (f.recipient_name || "—") + ", " + (f.recipient_phone || "—"));
    }
    /* Текст открытки. Раньше поле собиралось формой, но в текст заказа не
       попадало — флорист его не видел ни в боте, ни в CRM, и открытки уходили
       пустыми. Выносим отдельным блоком: это то, что пишут от руки. */
    if (f.add_card) {
      const cardText = String(f.card_text || "").trim();
      lines.push(
        "",
        "✉️ ОТКРЫТКА:",
        cardText || "— текст не указан, уточнить у клиента",
      );
    }

    lines.push("", "Клиент: " + (f.name || "—") + ", " + (f.phone || "—"));
    /* Человеческая подпись способа связи: в заказе менеджеру «call» ничего
       не говорит, а «звонок» сразу подсказывает, что надо набрать номер. */
    const CONTACT_LABELS = { call: "звонок", telegram: "Telegram", whatsapp: "WhatsApp", max: "MAX" };
    const contactWay = CONTACT_LABELS[o.messenger] || o.messenger || "—";
    lines.push("Связь: " + contactWay + " " + (o.messengerContact || ""));
    if (f.comment) lines.push("", "Комментарий: " + f.comment);
    return lines.join("\n");
  }

  /* Онлайн-оплата: сервер сам пересчитывает цены по каталогу и выставляет
     счёт в PayKeeper. Цены из localStorage сервер не принимает на веру. */
  /* Яндекс Сплит работает только на сервере Render (там ключи Яндекс Пэй) —
     запросы Сплита идут туда напрямую, а не через основной сервер. */
  function splitEndpoint() {
    return String((window.PALOMA_PAYMENT_CONFIG || {}).BACKUP_ENDPOINT || "").trim();
  }
  (function showSplitIfReady() {
    const opt = document.getElementById("coSplitPayOption");
    const ep = splitEndpoint();
    if (!opt || !ep || typeof fetch !== "function") return;
    fetch(ep + "?a=ping", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d && d.split) opt.hidden = false; })
      .catch(() => { /* сервер спит или Сплит не подключён — вариант не показываем */ });
  })();

  async function initPayment(orderData, split) {
    const f = orderData.form || {};
    /* Обрыв связи на телефоне (Safari пишет «Load failed», Chrome — «Failed
       to fetch») — повторяем запрос до двух раз с паузой, прежде чем считать,
       что оплата не создалась. Ответ сервера с ошибкой не повторяем. */
    const sendCreate = async (payload) => {
      for (let attempt = 0; ; attempt++) {
        const ctrl = typeof AbortController === "function" ? new AbortController() : null;
        const timer = ctrl ? setTimeout(() => ctrl.abort(), split ? 60000 : 25000) : 0;
        try {
          if (split) {
            return await fetch(splitEndpoint() + "?a=ypay-create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              signal: ctrl ? ctrl.signal : undefined,
            });
          }
          return await window.palomaFetch("?a=create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            signal: ctrl ? ctrl.signal : undefined,
          });
        } catch (e) {
          if (attempt >= 1) throw new Error("нет связи с сервером оплаты (" + (e && e.message ? e.message : "сеть") + ")");
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        } finally {
          clearTimeout(timer);
        }
      }
    };
    try {
      const res = await sendCreate(JSON.stringify({
          orderId: orderData.id,
          items: orderData.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty || 1,
          })),
          delivery: orderData.delivery,
          deliveryInfo: deliveryInfo(orderData),
          clientName: f.name || "",
          phone: f.phone || "",
            messengerContact: orderData.messengerContact || "",
          managerText: buildManagerText(orderData),
        }));

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Не удалось создать оплату");
      }

      /* Цель: переход на страницу оплаты (счёт создан, есть ссылка на оплату). */
      if (window.palomaGoal) window.palomaGoal("payment_start");
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("[PALOMA] PayKeeper:", err);
      /* Счёт создать не удалось. Раньше клиент видел alert, а заказ не уходил
         НИКУДА: менеджер о нём не узнавал вообще. Теперь заказ всё равно
         отправляется в бот с пометкой, что оплату надо согласовать руками —
         потерять заказ хуже, чем принять его без предоплаты. */
      const reason = err && err.message ? err.message : "ошибка связи";
      let delivered = false;
      try {
        delivered = await notifyManagerOfOrder(orderData, {
          header: "❗ ЗАКАЗ БЕЗ ОПЛАТЫ — онлайн-оплата не создалась",
          note:
            (split ? "Клиент выбрал Яндекс Сплит, но заказ в Яндекс Пэй не создался.\n"
              : "Клиент выбрал оплату картой, но счёт не выставился.\n") +
            "Причина: " + reason + "\n" +
            "СВЯЖИТЕСЬ С КЛИЕНТОМ и согласуйте оплату.",
        });
      } catch (e) {
        console.error("[PALOMA] уведомление о неудачной оплате:", e);
      }
      if (!delivered) {
        /* сервер вообще недоступен — заказ отдаём клиенту в мессенджер */
        await offerMessengerFallback(orderData);
      } else {
        alert(
          "Оплата картой сейчас недоступна.\n\n" +
            "Заказ мы приняли — менеджер свяжется с вами, чтобы согласовать оплату.",
        );
      }
      emptyCart();
      showSuccess(orderData.id);
    }
  }

  window.__coNormContact = normContact; /* для проверки валидации из теста */

  /* ── Кастомный дропдаун вместо нативного <select> ──────────────────
     Нативный список рисует ОС: системный шрифт, синяя подсветка, свои
     отступы — под типографику PALOMA его не привести. Оборачиваем select
     в кнопку + панель, сам select оставляем в DOM (скрытым): вся прежняя
     логика (updateTimeConstraints, сериализация формы) работает с ним
     как раньше, мы только рисуем поверх.                            */
  const pickers = [];

  function enhanceSelect(sel) {
    if (!sel || sel.dataset.picker) return;
    sel.dataset.picker = "1";

    const wrap = document.createElement("div");
    wrap.className = "co-pick";
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "co-pick__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    const lbl = sel.id && document.querySelector('label[for="' + sel.id + '"]');
    if (lbl) btn.setAttribute("aria-label", lbl.textContent.trim());

    const val = document.createElement("span");
    val.className = "co-pick__value";
    btn.appendChild(val);
    btn.insertAdjacentHTML(
      "beforeend",
      '<svg class="co-pick__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    );

    const list = document.createElement("div");
    list.className = "co-pick__list";
    list.setAttribute("role", "listbox");
    list.hidden = true;

    wrap.appendChild(btn);
    wrap.appendChild(list);

    const api = { sel, btn, list, val, wrap, open: false };

    api.render = function () {
      val.textContent = sel.selectedOptions[0]
        ? sel.selectedOptions[0].textContent
        : "—";
      list.innerHTML = "";
      [...sel.options].forEach((o) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "co-pick__opt";
        item.textContent = o.textContent;
        item.dataset.value = o.value;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(o.value === sel.value));
        if (o.disabled) {
          item.disabled = true;
          item.classList.add("is-disabled");
        }
        if (o.value === sel.value) item.classList.add("is-selected");
        list.appendChild(item);
      });
    };

    api.close = function () {
      if (!api.open) return;
      api.open = false;
      list.hidden = true;
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };

    api.openList = function () {
      pickers.forEach((p) => p !== api && p.close());
      api.render();
      api.open = true;
      list.hidden = false;
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      /* прокручиваем к выбранному, чтобы список открывался «на нём» */
      const cur = list.querySelector(".is-selected");
      if (cur) list.scrollTop = cur.offsetTop - list.clientHeight / 2 + cur.offsetHeight / 2;
    };

    btn.addEventListener("click", () => (api.open ? api.close() : api.openList()));

    list.addEventListener("click", (e) => {
      const item = e.target.closest(".co-pick__opt");
      if (!item || item.disabled) return;
      sel.value = item.dataset.value;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      api.render();
      api.close();
      btn.focus();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const opts = [...sel.options].filter((o) => !o.disabled);
        const i = opts.indexOf(sel.selectedOptions[0]);
        const next = opts[e.key === "ArrowDown" ? i + 1 : i - 1];
        if (next) {
          sel.value = next.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          api.render();
        }
      } else if (e.key === "Escape") {
        api.close();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        api.open ? api.close() : api.openList();
      }
    });

    api.render();
    pickers.push(api);
  }

  /* значения/доступность меняет updateTimeConstraints напрямую в select,
     без события change — поэтому перерисовываем принудительно */
  function refreshPickers() {
    pickers.forEach((p) => {
      p.render();
      if (p.open) p.close();
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".co-pick")) pickers.forEach((p) => p.close());
  });

  function init() {
    updateView();
    /* Цель: начали оформление заказа — открыли чекаут с непустой корзиной. */
    if (getCart().length && window.palomaGoal) window.palomaGoal("begin_checkout");
    handleDeliveryToggle();
    updateMessengerFields();

    const dateInput = document.getElementById("co-date");
    if (dateInput) {
      dateInput.min = new Date().toISOString().split("T")[0];
    }
    document.querySelectorAll("select.co-select").forEach(enhanceSelect);
    updateTimeConstraints();

    $form?.querySelectorAll(".co-input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-error");
        const err = document.getElementById(input.id + "-error");
        if (err) err.hidden = true;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ── Маска телефона на checkout (как в подвале): +7 (___) ___-__-__ ──
   checkout.html не подключает script.js, поэтому маска продублирована здесь.
   Исключения — поля с data-nomask (напр. WhatsApp в международном формате). */
(function(){
  "use strict";
  var TPL_SLOTS = [4,5,6,9,10,11,13,14,16,17];
  var SEL = 'input[type="tel"]:not([data-nomask]), input[inputmode="tel"]:not([data-nomask])';
  function digitsFrom(str){
    var d = (str||"").replace(/\D/g,"");
    if (d[0] === "7" || d[0] === "8") d = d.slice(1);
    return d.slice(0,10);
  }
  function format(d){
    return "+7 (" +
      (d.slice(0,3)+"___").slice(0,3) + ") " +
      (d.slice(3,6)+"___").slice(0,3) + "-" +
      (d.slice(6,8)+"__").slice(0,2) + "-" +
      (d.slice(8,10)+"__").slice(0,2);
  }
  function caretPos(n){ return n === 0 ? 4 : TPL_SLOTS[Math.min(n,10)-1] + 1; }
  function setCaret(input,pos){ try{ input.setSelectionRange(pos,pos); }catch(e){} }
  function attach(input){
    if (input.dataset.phoneMask) return;
    input.dataset.phoneMask = "1";
    input.addEventListener("focus", function(){
      if (!input.value){ input.value = format(""); requestAnimationFrame(function(){ setCaret(input,4); }); }
    });
    input.addEventListener("blur", function(){
      if (digitsFrom(input.value).length === 0) input.value = "";
    });
    input.addEventListener("input", function(){
      var d = digitsFrom(input.value);
      input.value = format(d);
      setCaret(input, caretPos(d.length));
    });
    input.addEventListener("click", function(){
      var d = digitsFrom(input.value);
      setCaret(input, caretPos(d.length));
    });
  }
  function initMask(){
    document.querySelectorAll(SEL).forEach(attach);
    document.addEventListener("focusin", function(e){
      var t = e.target;
      if (t && t.matches && t.matches(SEL)){
        var isNew = !t.dataset.phoneMask;
        attach(t);
        if (isNew && !t.value){ t.value = format(""); requestAnimationFrame(function(){ setCaret(t,4); }); }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMask);
  else initMask();
})();

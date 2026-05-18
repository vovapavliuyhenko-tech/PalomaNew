(function PalomaBlog() {
  "use strict";

  const articles = window.PALOMA_BLOG || [];

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function initBlogPage() {
    const featuredEl = document.getElementById("blogFeatured");
    const gridEl = document.getElementById("blogGrid");
    const filters = document.querySelectorAll("[data-blog-cat]");
    if (!featuredEl && !gridEl) return;

    let currentCat = "all";

    function renderFeatured() {
      if (!featuredEl) return;
      const art = articles.find((a) => a.featured);
      if (!art) {
        featuredEl.innerHTML = "";
        featuredEl.style.display = "none";
        return;
      }
      featuredEl.style.display = "";
      featuredEl.innerHTML = `
        <div class="blog-featured__inner">
          <a class="blog-featured__image"
             href="blog-article.html?id=${escHtml(art.id)}"
             aria-label="${escHtml(art.title)}"
             style="background: ${escHtml(art.bg)};">
          </a>
          <div class="blog-featured__body">
            <span class="blog-featured__cat">${escHtml(art.categoryLabel)}</span>
            <h2 class="blog-featured__title">
              <a href="blog-article.html?id=${escHtml(art.id)}">
                ${escHtml(art.title)}
              </a>
            </h2>
            <p class="blog-featured__excerpt">${escHtml(art.excerpt)}</p>
            <div class="blog-featured__meta">
              <span>${formatDate(art.date)}</span>
              <span>${escHtml(art.readTime)}</span>
            </div>
            <a class="blog-featured__link"
               href="blog-article.html?id=${escHtml(art.id)}">
              Читать →
            </a>
          </div>
        </div>`;
    }

    function renderGrid(cat) {
      if (!gridEl) return;
      const list =
        cat === "all"
          ? articles.filter((a) => !a.featured)
          : articles.filter((a) => a.category === cat && !a.featured);

      if (!list.length) {
        gridEl.innerHTML = `
          <div class="blog-empty">
            <p>В этой рубрике пока нет статей.</p>
            <button type="button" class="btn btn--outline" data-blog-cat="all">
              Посмотреть все
            </button>
          </div>`;
        gridEl
          .querySelector('[data-blog-cat="all"]')
          ?.addEventListener("click", () => setFilter("all"));
        return;
      }

      gridEl.innerHTML = list
        .map(
          (art, i) => `
        <article class="blog-card${i === 0 ? " blog-card--large" : ""}">
          <a class="blog-card__image"
             href="blog-article.html?id=${escHtml(art.id)}"
             aria-label="${escHtml(art.title)}"
             style="background: ${escHtml(art.bg)};">
            <span class="blog-card__cat">${escHtml(art.categoryLabel)}</span>
          </a>
          <div class="blog-card__body">
            <h3 class="blog-card__title">
              <a href="blog-article.html?id=${escHtml(art.id)}">
                ${escHtml(art.title)}
              </a>
            </h3>
            <p class="blog-card__excerpt">${escHtml(art.excerpt)}</p>
            <div class="blog-card__meta">
              <span>${formatDate(art.date)}</span>
              <span>${escHtml(art.readTime)}</span>
            </div>
            <a class="blog-card__link"
               href="blog-article.html?id=${escHtml(art.id)}">
              Читать →
            </a>
          </div>
        </article>`
        )
        .join("");
      window.palomaRebindCursorHovers?.();
    }

    function setFilter(cat) {
      currentCat = cat;
      filters.forEach((f) =>
        f.classList.toggle("is-active", f.dataset.blogCat === cat)
      );
      renderGrid(cat);
    }

    filters.forEach((f) =>
      f.addEventListener("click", () =>
        setFilter(f.dataset.blogCat || "all")
      )
    );

    renderFeatured();
    renderGrid("all");

    const subForm = document.getElementById("blogSubscribeForm");
    const subSuccess = document.getElementById("blogSubscribeSuccess");
    subForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      subForm.style.display = "none";
      if (subSuccess) subSuccess.hidden = false;
    });
  }

  function initArticlePage() {
    const contentEl = document.getElementById("articleContent");
    const notFoundEl = document.getElementById("articleNotFound");
    if (!contentEl) return;

    const id = getParam("id");
    const art = articles.find((a) => a.id === id);

    if (!art) {
      if (notFoundEl) notFoundEl.hidden = false;
      return;
    }

    document.title = `${art.title} — Журнал PALOMA`;
    const breadTitle = document.getElementById("articleBreadcrumbTitle");
    if (breadTitle) breadTitle.textContent = art.title;

    const related = articles
      .filter((a) => a.category === art.category && a.id !== art.id)
      .slice(0, 3);

    const relatedHtml = related.length
      ? `
      <section class="article-related">
        <div class="article-related__inner">
          <h2 class="article-related__title">Читайте также</h2>
          <div class="article-related__grid">
            ${related
              .map(
                (r) => `
              <article class="blog-card">
                <a class="blog-card__image"
                   href="blog-article.html?id=${escHtml(r.id)}"
                   style="background: ${escHtml(r.bg)};"
                   aria-label="${escHtml(r.title)}">
                  <span class="blog-card__cat">${escHtml(r.categoryLabel)}</span>
                </a>
                <div class="blog-card__body">
                  <h3 class="blog-card__title">
                    <a href="blog-article.html?id=${escHtml(r.id)}">
                      ${escHtml(r.title)}
                    </a>
                  </h3>
                  <p class="blog-card__excerpt">${escHtml(r.excerpt)}</p>
                  <a class="blog-card__link"
                     href="blog-article.html?id=${escHtml(r.id)}">
                    Читать →
                  </a>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>`
      : "";

    contentEl.innerHTML = `
      <section class="article-hero">
        <div class="article-hero__inner">
          <span class="article-hero__cat">${escHtml(art.categoryLabel)}</span>
          <h1 class="article-hero__title">${escHtml(art.title)}</h1>
          <div class="article-hero__meta">
            <span>${formatDate(art.date)}</span>
            <span>${escHtml(art.readTime)} чтения</span>
          </div>
        </div>
        <div class="article-hero__image"
             style="background: ${escHtml(art.bg)};"
             role="img"
             aria-label="${escHtml(art.alt || art.title)}">
        </div>
      </section>

      <div class="article-body">
        <div class="article-body__inner">${art.content}</div>
      </div>

      ${relatedHtml}

      <section class="article-cta">
        <div class="article-cta__inner">
          <h2 class="article-cta__title">Выбрать букет</h2>
          <p class="article-cta__text">
            Заглядывайте в каталог или задайте вопрос флористу —
            поможем с выбором.
          </p>
          <div class="article-cta__actions">
            <a href="catalog.html" class="btn btn--dark">
              Перейти в каталог
            </a>
            <a href="https://wa.me/79180000000" target="_blank"
               rel="noopener" class="btn btn--outline">
              Задать вопрос
            </a>
          </div>
        </div>
      </section>`;

    window.palomaRebindCursorHovers?.();
  }

  initBlogPage();
  initArticlePage();
})();

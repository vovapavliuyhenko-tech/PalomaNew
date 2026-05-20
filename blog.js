(function PalomaBlog() {
  "use strict";

  const articles = window.PALOMA_BLOG || [];
  const tag = "div";

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

  function cardHtml(art, large) {
    const largeClass = large ? " blog-card--large" : "";
    return (
      `<article class="blog-card${largeClass}">` +
      `<a class="blog-card__image" href="blog-article.html?id=${escHtml(art.id)}"` +
      ` aria-label="${escHtml(art.title)}" style="background: ${escHtml(art.bg)};" data-cursor="hover">` +
      `<span class="blog-card__cat">${escHtml(art.categoryLabel)}</span></a>` +
      `<${tag} class="blog-card__body">` +
      `<h3 class="blog-card__title"><a href="blog-article.html?id=${escHtml(art.id)}">${escHtml(art.title)}</a></h3>` +
      `<p class="blog-card__excerpt">${escHtml(art.excerpt)}</p>` +
      `<${tag} class="blog-card__meta"><time datetime="${escHtml(art.date)}">${formatDate(art.date)}</time>` +
      `<span>${escHtml(art.readTime)}</span></${tag}>` +
      `<a class="blog-card__link" href="blog-article.html?id=${escHtml(art.id)}" data-cursor="hover">Читать</a>` +
      `</${tag}></article>`
    );
  }

  function initBlogPage() {
    const gridEl = document.getElementById("blogGrid");
    const filters = document.querySelectorAll("[data-blog-cat]");
    if (!gridEl) return;

    function renderGrid(cat) {
      const list =
        cat === "all"
          ? [...articles]
          : articles.filter((a) => a.category === cat);

      if (!list.length) {
        gridEl.innerHTML =
          `<${tag} class="blog-empty"><p>В этой рубрике пока нет статей.</p>` +
          `<button type="button" class="btn btn--outline" data-blog-cat="all">Все материалы</button></${tag}>`;
        gridEl
          .querySelector('[data-blog-cat="all"]')
          ?.addEventListener("click", () => setFilter("all"));
        return;
      }

      gridEl.innerHTML = list
        .map((art, i) => cardHtml(art, i === 0))
        .join("");

      window.palomaRebindCursorHovers?.();
    }

    function setFilter(cat) {
      filters.forEach((f) =>
        f.classList.toggle("is-active", f.dataset.blogCat === cat),
      );
      renderGrid(cat);
    }

    filters.forEach((f) =>
      f.addEventListener("click", () => setFilter(f.dataset.blogCat || "all")),
    );

    renderGrid("all");
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

    document.title = `${art.title} — Блог PALOMA`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", art.excerpt);

    const breadTitle = document.getElementById("articleBreadcrumbTitle");
    if (breadTitle) breadTitle.textContent = art.title;

    const related = articles.filter((a) => a.id !== art.id).slice(0, 3);

    const relatedHtml = related.length
      ? `<section class="article-related" aria-labelledby="article-related-heading">
          <${tag} class="article-related__inner">
            <h2 class="article-related__title" id="article-related-heading">Читайте также</h2>
            <${tag} class="article-related__grid">${related.map((r) => cardHtml(r, false)).join("")}</${tag}>
          </${tag}>
        </section>`
      : "";

    contentEl.innerHTML =
      `<section class="article-hero">
        <${tag} class="article-hero__inner">
          <span class="article-hero__cat">${escHtml(art.categoryLabel)}</span>
          <h1 class="article-hero__title">${escHtml(art.title)}</h1>
          <${tag} class="article-hero__meta">
            <time datetime="${escHtml(art.date)}">${formatDate(art.date)}</time>
            <span>${escHtml(art.readTime)} чтения</span>
          </${tag}>
        </${tag}>
        <${tag} class="article-hero__image" style="background: ${escHtml(art.bg)};"
             role="img" aria-label="${escHtml(art.alt || art.title)}"></${tag}>
      </section>
      <${tag} class="article-body"><${tag} class="article-body__inner">${art.content}</${tag}></${tag}>
      ${relatedHtml}
      <section class="article-cta">
        <${tag} class="article-cta__inner">
          <h2 class="article-cta__title">Выбрать букет</h2>
          <p class="article-cta__text">Загляните в каталог или напишите нам — поможем с выбором.</p>
          <${tag} class="article-cta__actions">
            <a href="catalog.html" class="btn btn--dark" data-cursor="hover">В каталог</a>
            <a href="https://wa.me/79180000000" target="_blank" rel="noopener" class="btn btn--outline" data-cursor="hover">Задать вопрос</a>
          </${tag}>
        </${tag}>
      </section>`;

    window.palomaRebindCursorHovers?.();
  }

  initBlogPage();
  initArticlePage();
})();

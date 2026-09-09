const {
  RECIPES,
  CATEGORY_META,
  QUICK_PICKS,
  TRAIT_FILTERS,
  CREATOR,
} = window.MussriData;

const FAV_KEY = "mussri-cocina-favorites-v1";
const CHECK_KEY = "mussri-cocina-checks-v1";

const state = {
  view: "home",
  query: "",
  meal: "",
  traits: new Set(),
  time: "",
  sort: "newest",
  favorites: loadJson(FAV_KEY, []),
  checks: loadJson(CHECK_KEY, {}),
  cook: { recipeId: null, step: 0 },
  toastTimer: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTime(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return null;
  const m = Number(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

function recipeTime(recipe) {
  return recipe.totalTime ?? recipe.cookTime ?? recipe.prepTime ?? null;
}

function categoryLabel(key) {
  return CATEGORY_META[key]?.label || key;
}

function getRecipe(id) {
  return RECIPES.find((r) => r.id === id);
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    state.favorites = state.favorites.filter((x) => x !== id);
    showToast("Quitada de favoritos");
  } else {
    state.favorites = [...state.favorites, id];
    showToast("Guardada en favoritos");
  }
  saveJson(FAV_KEY, state.favorites);
  refreshCurrentView();
}

function showToast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(recipe, query) {
  if (!query) return true;
  const q = normalize(query);
  const haystack = normalize(
    [
      recipe.title,
      recipe.shortDescription,
      recipe.category,
      recipe.subcategory,
      ...(recipe.tags || []),
      ...(recipe.ingredients || []),
    ].join(" ")
  );
  return haystack.includes(q);
}

function matchesTime(recipe, time) {
  if (!time) return true;
  const t = recipeTime(recipe);
  if (t == null) return false;
  if (time === "lt15") return t < 15;
  if (time === "15-30") return t >= 15 && t <= 30;
  if (time === "gt30") return t > 30;
  return true;
}

function matchesTraits(recipe, traits) {
  if (!traits.size) return true;
  const tags = (recipe.tags || []).map(normalize);
  return [...traits].every((traitId) => {
    const def = TRAIT_FILTERS.find((t) => t.id === traitId);
    if (!def) return true;
    return tags.includes(normalize(def.tag));
  });
}

function getFilteredRecipes({ ignoreQuery = false } = {}) {
  let list = RECIPES.filter((r) => {
    if (!ignoreQuery && !matchesQuery(r, state.query)) return false;
    if (state.meal && r.category !== state.meal) return false;
    if (!matchesTime(r, state.time)) return false;
    if (!matchesTraits(r, state.traits)) return false;
    return true;
  });

  list = sortRecipes(list, state.sort);
  return list;
}

function sortRecipes(list, sort) {
  const copy = [...list];
  if (sort === "az") {
    copy.sort((a, b) => a.title.localeCompare(b.title, "es"));
  } else if (sort === "oldest") {
    copy.sort((a, b) => (a.datePublished || "").localeCompare(b.datePublished || ""));
  } else if (sort === "fastest") {
    copy.sort((a, b) => {
      const ta = recipeTime(a);
      const tb = recipeTime(b);
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;
      return ta - tb;
    });
  } else {
    copy.sort((a, b) => (b.datePublished || "").localeCompare(a.datePublished || ""));
  }
  return copy;
}

function availableCategories() {
  const used = new Set(RECIPES.map((r) => r.category));
  return Object.entries(CATEGORY_META)
    .filter(([key]) => used.has(key))
    .map(([key, meta]) => ({ key, ...meta }));
}

function availableTraitFilters() {
  const allTags = new Set(
    RECIPES.flatMap((r) => (r.tags || []).map(normalize))
  );
  return TRAIT_FILTERS.filter((t) => allTags.has(normalize(t.tag)));
}

function availableMealFilters() {
  return availableCategories();
}

function hasAnyTimedRecipe() {
  return RECIPES.some((r) => recipeTime(r) != null);
}

/* -------------------- Media helpers -------------------- */
function mediaHtml(recipe, { lazy = true, className = "" } = {}) {
  if (recipe.image) {
    const loading = lazy ? 'loading="lazy"' : "";
    return `<img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(
      recipe.imageAlt || recipe.title
    )}" ${loading} class="${className}" width="640" height="480" />`;
  }
  const label = recipe.isDemo ? "Demo · sin foto" : "Sin imagen";
  return `<div class="recipe-card__placeholder ${className}" role="img" aria-label="${escapeHtml(
    recipe.imageAlt || label
  )}">${escapeHtml(label)}</div>`;
}

function tagsHtml(recipe, limit = 3) {
  return (recipe.tags || [])
    .slice(0, limit)
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
}

function cardHtml(recipe) {
  const time = formatTime(recipeTime(recipe));
  const fav = isFavorite(recipe.id);
  const badge = recipe.isDemo
    ? `<span class="recipe-card__badge recipe-card__badge--demo">Demo</span>`
    : `<span class="recipe-card__badge">${escapeHtml(
        categoryLabel(recipe.category)
      )}</span>`;

  return `
    <article class="recipe-card" data-recipe-id="${escapeHtml(recipe.id)}">
      <div class="recipe-card__media">
        ${mediaHtml(recipe)}
        ${badge}
        <button
          type="button"
          class="recipe-card__fav"
          data-fav-toggle="${escapeHtml(recipe.id)}"
          aria-label="${fav ? "Quitar de favoritos" : "Guardar en favoritos"}"
          aria-pressed="${fav}"
        >${fav ? "♥" : "♡"}</button>
      </div>
      <div class="recipe-card__body">
        <div class="recipe-card__meta">
          <span class="recipe-card__cat">${escapeHtml(
            categoryLabel(recipe.category)
          )}</span>
          ${time ? `<span>⏱ ${escapeHtml(time)}</span>` : ""}
        </div>
        <h3 class="recipe-card__title">${escapeHtml(recipe.title)}</h3>
        <p class="recipe-card__desc">${escapeHtml(recipe.shortDescription)}</p>
        <div class="recipe-card__tags">${tagsHtml(recipe)}</div>
      </div>
    </article>
  `;
}

function renderCards(container, recipes) {
  container.innerHTML = recipes.map(cardHtml).join("");
}

/* -------------------- Views -------------------- */
function setView(view, { recipeId = null, push = true } = {}) {
  state.view = view;
  document.body.classList.toggle("cook-active", view === "cook");

  $$(".view").forEach((el) => {
    el.hidden = true;
  });

  const map = {
    home: "#view-home",
    explore: "#view-explore",
    favorites: "#view-favorites",
    about: "#view-about",
    recipe: "#view-recipe",
    cook: "#view-cook",
  };

  const target = $(map[view] || "#view-home");
  if (target) target.hidden = false;

  $$("[data-nav]").forEach((link) => {
    const nav = link.getAttribute("data-nav");
    const current = ["home", "explore", "favorites", "about"].includes(view)
      ? view
      : "";
    if (current && nav === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (view === "home") renderHome();
  if (view === "explore") renderExplore();
  if (view === "favorites") renderFavorites();
  if (view === "recipe" && recipeId) renderRecipe(recipeId);
  if (view === "cook" && recipeId) renderCook(recipeId);

  if (push) {
    if (view === "recipe" && recipeId) {
      location.hash = `recipe=${recipeId}`;
    } else if (view === "cook" && recipeId) {
      location.hash = `cook=${recipeId}`;
    } else if (view === "home") {
      history.replaceState(null, "", location.pathname + location.search);
    } else {
      location.hash = view;
    }
  }

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function refreshCurrentView() {
  if (state.view === "home") renderHome();
  else if (state.view === "explore") renderExplore();
  else if (state.view === "favorites") renderFavorites();
  else if (state.view === "recipe") {
    const id = location.hash.replace(/^#recipe=/, "");
    if (id) renderRecipe(id);
  } else if (state.view === "cook") {
    renderCook(state.cook.recipeId);
  }
}

function renderHome() {
  const picks = $("#quick-picks");
  picks.innerHTML = QUICK_PICKS.map(
    (p) =>
      `<button type="button" class="quick-pick" data-quick="${escapeHtml(
        p.id
      )}" role="listitem">${escapeHtml(p.label)}</button>`
  ).join("");

  const featured = RECIPES.filter((r) => r.featured).slice(0, 6);
  renderCards($("#featured-grid"), featured.length ? featured : RECIPES.slice(0, 4));
}

function renderExplore() {
  const recipes = getFilteredRecipes();
  const count = $("#recipe-count");
  count.textContent = `${recipes.length} receta${
    recipes.length === 1 ? "" : "s"
  } disponible${recipes.length === 1 ? "" : "s"}`;

  const chips = $("#category-chips");
  const cats = availableCategories();
  chips.innerHTML = [
    `<button type="button" class="chip ${
      !state.meal ? "is-active" : ""
    }" data-meal="" aria-pressed="${!state.meal}">Todas</button>`,
    ...cats.map(
      (c) =>
        `<button type="button" class="chip ${
          state.meal === c.key ? "is-active" : ""
        }" data-meal="${escapeHtml(c.key)}" aria-pressed="${
          state.meal === c.key
        }">${escapeHtml(c.label)}</button>`
    ),
  ].join("");

  const mealBox = $("#meal-filters");
  mealBox.innerHTML = availableMealFilters()
    .map(
      (c) =>
        `<button type="button" class="chip ${
          state.meal === c.key ? "is-active" : ""
        }" data-meal="${escapeHtml(c.key)}" aria-pressed="${
          state.meal === c.key
        }">${escapeHtml(c.label)}</button>`
    )
    .join("");

  const traitBox = $("#trait-filters");
  const traits = availableTraitFilters();
  traitBox.innerHTML = traits.length
    ? traits
        .map(
          (t) =>
            `<button type="button" class="chip ${
              state.traits.has(t.id) ? "is-active" : ""
            }" data-trait="${escapeHtml(t.id)}" aria-pressed="${state.traits.has(
              t.id
            )}">${escapeHtml(t.label)}</button>`
        )
        .join("")
    : `<p class="source-note">Aún no hay características verificables.</p>`;

  // Hide time filters without data
  const timeFieldset = $("#time-filters").closest("fieldset");
  if (timeFieldset) timeFieldset.hidden = !hasAnyTimedRecipe();
  $$("#time-filters .chip").forEach((chip) => {
    const val = chip.dataset.time;
    chip.classList.toggle("is-active", state.time === val);
    chip.setAttribute("aria-pressed", String(state.time === val));
  });

  $("#explore-search").value = state.query;
  $("#sort-select").value = state.sort;

  const grid = $("#explore-grid");
  const empty = $("#explore-empty");
  if (!recipes.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <h2>No encontramos recetas${
        state.query ? ` con “${escapeHtml(state.query)}”` : ""
      }.</h2>
      <p>Prueba otra búsqueda o limpia los filtros.</p>
      <button type="button" class="btn btn--primary" id="empty-clear">Ver todas las recetas</button>
    `;
  } else {
    empty.hidden = true;
    renderCards(grid, recipes);
  }
}

function renderFavorites() {
  const favs = RECIPES.filter((r) => isFavorite(r.id));
  const grid = $("#favorites-grid");
  const empty = $("#favorites-empty");
  if (!favs.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <h2>Aún no tienes recetas favoritas.</h2>
      <p>Toca ♡ en cualquier receta para guardarla aquí.</p>
      <a href="#explore" class="btn btn--primary" data-nav="explore">Explorar recetas</a>
    `;
  } else {
    empty.hidden = true;
    renderCards(grid, favs);
  }
}

function checkedKey(recipeId) {
  return recipeId;
}

function renderRecipe(id) {
  const recipe = getRecipe(id);
  const root = $("#recipe-detail");
  if (!recipe) {
    root.innerHTML = `
      <button type="button" class="btn btn--ghost detail-back" data-nav="explore">← Volver</button>
      <div class="empty-state">
        <h2>Receta no encontrada</h2>
        <p>Es posible que el enlace esté incompleto.</p>
        <a href="#explore" class="btn btn--primary" data-nav="explore">Ver recetas</a>
      </div>`;
    return;
  }

  const fav = isFavorite(recipe.id);
  const time = formatTime(recipeTime(recipe));
  const checks = state.checks[checkedKey(recipe.id)] || [];

  const nutritionItems = [
    ["kcal", recipe.calories, "Calorías"],
    ["g", recipe.protein, "Proteína"],
    ["g", recipe.carbs, "Carbohidratos"],
    ["g", recipe.fat, "Grasas"],
  ].filter(([, val]) => val != null);

  const ingredients = (recipe.ingredients || [])
    .map((ing, i) => {
      const checked = checks.includes(i);
      return `
        <li>
          <label>
            <input type="checkbox" data-ing-check="${i}" ${
        checked ? "checked" : ""
      } />
            <span>${escapeHtml(ing)}</span>
          </label>
        </li>`;
    })
    .join("");

  const steps = (recipe.steps || [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");

  root.innerHTML = `
    <button type="button" class="btn btn--ghost detail-back" data-back>← Volver</button>
    ${
      recipe.isDemo
        ? `<div class="demo-banner">DEMO DATA — Esta receta es solo para demostrar la interfaz. No pertenece al contenido real de Doctor Mussri.</div>`
        : ""
    }
    <div class="detail-hero">${mediaHtml(recipe, { lazy: false })}</div>
    <header class="detail-header">
      <h1>${escapeHtml(recipe.title)}</h1>
      <div class="detail-meta">
        <span class="meta-pill meta-pill--cat">${escapeHtml(
          categoryLabel(recipe.category)
        )}</span>
        ${time ? `<span class="meta-pill">⏱ ${escapeHtml(time)}</span>` : ""}
        ${
          recipe.servings != null
            ? `<span class="meta-pill">🍽 ${escapeHtml(
                String(recipe.servings)
              )} porción${recipe.servings === 1 ? "" : "es"}</span>`
            : ""
        }
        ${(recipe.tags || [])
          .slice(0, 4)
          .map((t) => `<span class="meta-pill">${escapeHtml(t)}</span>`)
          .join("")}
      </div>
      <p>${escapeHtml(recipe.shortDescription)}</p>
    </header>

    <div class="detail-actions">
      <button type="button" class="btn btn--secondary ${
        fav ? "is-fav" : ""
      }" data-fav-toggle="${escapeHtml(recipe.id)}" aria-pressed="${fav}">
        ${fav ? "♥ En favoritos" : "♡ Favorito"}
      </button>
      <button type="button" class="btn btn--secondary" data-share="${escapeHtml(
        recipe.id
      )}">Compartir</button>
      ${
        (recipe.steps || []).length
          ? `<button type="button" class="btn btn--primary" data-cook="${escapeHtml(
              recipe.id
            )}">Modo cocinar</button>`
          : ""
      }
    </div>

    <section class="detail-block" aria-labelledby="ing-title">
      <h2 id="ing-title">Ingredientes</h2>
      ${
        ingredients
          ? `<ul class="ingredient-list">${ingredients}</ul>`
          : `<p class="source-note">Ingredientes: No especificado. Revisa la publicación original.</p>`
      }
    </section>

    <section class="detail-block" aria-labelledby="steps-title">
      <h2 id="steps-title">Preparación</h2>
      ${
        steps
          ? `<ol class="steps-list">${steps}</ol>`
          : `<p class="source-note">Pasos: No especificado. Mira el reel original para la preparación completa.</p>`
      }
    </section>

    ${
      nutritionItems.length
        ? `<section class="detail-block" aria-labelledby="nut-title">
            <h2 id="nut-title">Nutrición</h2>
            <div class="nutrition-grid">
              ${nutritionItems
                .map(
                  ([unit, val, label]) => `
                <div class="nutrition-item">
                  <strong>${escapeHtml(String(val))}${
                    unit === "kcal" ? "" : " " + unit
                  }</strong>
                  <span>${escapeHtml(label)}</span>
                </div>`
                )
                .join("")}
            </div>
            <p class="source-note">Valores publicados por el creador cuando están disponibles.</p>
          </section>`
        : ""
    }

    <section class="detail-block">
      <h2>Fuente</h2>
      <p class="source-note">${escapeHtml(
        recipe.sourceNote || `Publicado por ${CREATOR.handle}`
      )}</p>
      <a class="btn btn--primary btn--block" href="${escapeHtml(
        recipe.instagramUrl
      )}" target="_blank" rel="noopener noreferrer">Ver receta original en Instagram</a>
    </section>
  `;

  injectSchema(recipe);
}

function injectSchema(recipe) {
  const el = $("#schema-org");
  if (!recipe || recipe.isDemo) {
    el.textContent = "";
    return;
  }
  const data = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.shortDescription,
    image: recipe.image ? [new URL(recipe.image, location.href).href] : undefined,
    author: {
      "@type": "Person",
      name: CREATOR.fullName,
      sameAs: CREATOR.instagramUrl,
    },
    datePublished: recipe.datePublished || undefined,
    recipeCategory: categoryLabel(recipe.category),
    recipeIngredient: recipe.ingredients?.length ? recipe.ingredients : undefined,
    recipeInstructions: recipe.steps?.length
      ? recipe.steps.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text,
        }))
      : undefined,
    totalTime:
      recipeTime(recipe) != null ? `PT${recipeTime(recipe)}M` : undefined,
    recipeYield:
      recipe.servings != null ? String(recipe.servings) : undefined,
    nutrition:
      recipe.calories != null || recipe.protein != null
        ? {
            "@type": "NutritionInformation",
            calories: recipe.calories != null ? `${recipe.calories} kcal` : undefined,
            proteinContent:
              recipe.protein != null ? `${recipe.protein} g` : undefined,
            carbohydrateContent:
              recipe.carbs != null ? `${recipe.carbs} g` : undefined,
            fatContent: recipe.fat != null ? `${recipe.fat} g` : undefined,
          }
        : undefined,
  };
  el.textContent = JSON.stringify(data);
}

function renderCook(id) {
  const recipe = getRecipe(id);
  const shell = $("#cook-shell");
  if (!recipe || !(recipe.steps || []).length) {
    shell.innerHTML = `
      <div class="empty-state">
        <h2>Modo cocinar no disponible</h2>
        <button type="button" class="btn btn--primary" data-open-recipe="${escapeHtml(
          id || ""
        )}">Volver a la receta</button>
      </div>`;
    return;
  }

  state.cook.recipeId = id;
  const steps = recipe.steps;
  if (state.cook.step >= steps.length) state.cook.step = steps.length - 1;
  if (state.cook.step < 0) state.cook.step = 0;
  const i = state.cook.step;
  const isFirst = i === 0;
  const isLast = i === steps.length - 1;

  shell.innerHTML = `
    <div class="cook-top">
      <button type="button" class="btn btn--ghost btn--sm" data-exit-cook="${escapeHtml(
        id
      )}">✕ Salir</button>
      <p class="cook-progress">Paso ${i + 1} de ${steps.length}</p>
    </div>
    <div class="cook-step" aria-live="polite">
      <div class="cook-step__num">Paso ${i + 1}</div>
      <p class="cook-step__text">${escapeHtml(steps[i])}</p>
    </div>
    <div class="cook-nav">
      <button type="button" class="btn btn--secondary" data-cook-prev ${
        isFirst ? "disabled" : ""
      }>← Anterior</button>
      <button type="button" class="btn btn--primary" data-cook-next>
        ${isLast ? "Listo ✓" : "Siguiente →"}
      </button>
    </div>
  `;
}

/* -------------------- Sharing / surprise -------------------- */
async function shareRecipe(id) {
  const recipe = getRecipe(id);
  if (!recipe) return;
  const url = `${location.origin}${location.pathname}#recipe=${recipe.id}`;
  const payload = {
    title: recipe.title,
    text: `${recipe.title} — Mussri Cocina`,
    url,
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
  } catch {
    /* user cancelled */
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast("Enlace copiado");
  } catch {
    showToast(url);
  }
}

function surpriseMe() {
  const pool = getFilteredRecipes({ ignoreQuery: true });
  const list = pool.length ? pool : RECIPES;
  const pick = list[Math.floor(Math.random() * list.length)];
  if (!pick) return;
  setView("recipe", { recipeId: pick.id });
}

function applyQuickPick(id) {
  const pick = QUICK_PICKS.find((p) => p.id === id);
  if (!pick) return;
  state.query = pick.filters.query || "";
  state.meal = pick.filters.meal || "";
  state.traits = new Set(pick.filters.traits || []);
  state.time = "";
  setView("explore");
}

function clearFilters() {
  state.query = "";
  state.meal = "";
  state.traits = new Set();
  state.time = "";
  state.sort = "newest";
  renderExplore();
}

/* -------------------- Routing -------------------- */
function parseHash() {
  const hash = location.hash.replace(/^#/, "");
  if (!hash || hash === "home") return setView("home", { push: false });
  if (hash.startsWith("recipe=")) {
    return setView("recipe", {
      recipeId: decodeURIComponent(hash.slice(7)),
      push: false,
    });
  }
  if (hash.startsWith("cook=")) {
    state.cook.step = 0;
    return setView("cook", {
      recipeId: decodeURIComponent(hash.slice(5)),
      push: false,
    });
  }
  if (["explore", "favorites", "about"].includes(hash)) {
    return setView(hash, { push: false });
  }
  // Unknown → home
  setView("home", { push: false });
}

/* -------------------- Events -------------------- */
function bindEvents() {
  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      const view = nav.getAttribute("data-nav");
      if (view === "explore" && nav.id !== "empty-clear") {
        /* keep filters */
      }
      setView(view);
      return;
    }

    const card = e.target.closest(".recipe-card");
    const favBtn = e.target.closest("[data-fav-toggle]");
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(favBtn.getAttribute("data-fav-toggle"));
      return;
    }
    if (card) {
      setView("recipe", { recipeId: card.getAttribute("data-recipe-id") });
      return;
    }

    const quick = e.target.closest("[data-quick]");
    if (quick) {
      applyQuickPick(quick.getAttribute("data-quick"));
      return;
    }

    const mealChip = e.target.closest("[data-meal]");
    if (mealChip && (mealChip.matches(".chip") || mealChip.dataset.meal !== undefined)) {
      const val = mealChip.getAttribute("data-meal");
      state.meal = state.meal === val ? "" : val;
      renderExplore();
      return;
    }

    const traitChip = e.target.closest("[data-trait]");
    if (traitChip) {
      const id = traitChip.getAttribute("data-trait");
      if (state.traits.has(id)) state.traits.delete(id);
      else state.traits.add(id);
      renderExplore();
      return;
    }

    const timeChip = e.target.closest("[data-time]");
    if (timeChip) {
      const val = timeChip.getAttribute("data-time");
      state.time = state.time === val ? "" : val;
      renderExplore();
      return;
    }

    if (e.target.closest("#clear-filters") || e.target.closest("#empty-clear")) {
      clearFilters();
      return;
    }

    if (e.target.closest("#filters-toggle")) {
      const panel = $("#filters-panel");
      const btn = $("#filters-toggle");
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      return;
    }

    if (e.target.closest("#surprise-btn-hero") || e.target.closest("#surprise-btn-nav")) {
      surpriseMe();
      return;
    }

    const share = e.target.closest("[data-share]");
    if (share) {
      shareRecipe(share.getAttribute("data-share"));
      return;
    }

    const cook = e.target.closest("[data-cook]");
    if (cook) {
      state.cook = { recipeId: cook.getAttribute("data-cook"), step: 0 };
      setView("cook", { recipeId: state.cook.recipeId });
      return;
    }

    const exitCook = e.target.closest("[data-exit-cook]");
    if (exitCook) {
      setView("recipe", { recipeId: exitCook.getAttribute("data-exit-cook") });
      return;
    }

    const openRecipe = e.target.closest("[data-open-recipe]");
    if (openRecipe) {
      setView("recipe", { recipeId: openRecipe.getAttribute("data-open-recipe") });
      return;
    }

    if (e.target.closest("[data-cook-prev]")) {
      state.cook.step = Math.max(0, state.cook.step - 1);
      renderCook(state.cook.recipeId);
      return;
    }

    if (e.target.closest("[data-cook-next]")) {
      const recipe = getRecipe(state.cook.recipeId);
      const last = (recipe?.steps?.length || 1) - 1;
      if (state.cook.step >= last) {
        setView("recipe", { recipeId: state.cook.recipeId });
        showToast("¡Listo! Buen provecho");
        return;
      }
      state.cook.step += 1;
      renderCook(state.cook.recipeId);
      return;
    }

    if (e.target.closest("[data-back]")) {
      if (history.length > 1) history.back();
      else setView("explore");
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-ing-check]")) {
      const recipeId = location.hash.replace(/^#recipe=/, "");
      const idx = Number(e.target.getAttribute("data-ing-check"));
      const key = checkedKey(recipeId);
      const set = new Set(state.checks[key] || []);
      if (e.target.checked) set.add(idx);
      else set.delete(idx);
      state.checks[key] = [...set];
      saveJson(CHECK_KEY, state.checks);
    }

    if (e.target.id === "sort-select") {
      state.sort = e.target.value;
      renderExplore();
    }
  });

  const onSearchInput = (value) => {
    state.query = value.trim();
    if (state.view !== "explore") setView("explore");
    else renderExplore();
  };

  $("#hero-search").addEventListener("input", (e) => onSearchInput(e.target.value));
  $("#explore-search").addEventListener("input", (e) => onSearchInput(e.target.value));

  $("#hero-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    onSearchInput($("#hero-search").value);
  });
  $("#explore-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    onSearchInput($("#explore-search").value);
  });

  window.addEventListener("hashchange", parseHash);
}

function registerPwaHints() {
  // PWA-ready: register service worker when available (non-blocking).
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline support is optional in v1 */
    });
  }
}

function init() {
  bindEvents();
  parseHash();
  registerPwaHints();
}

init();

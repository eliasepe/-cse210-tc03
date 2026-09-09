/**
 * =============================================================================
 * RECETARIO DOCTOR MUSSRI — Fuente de datos
 * =============================================================================
 *
 * CÓMO AGREGAR UNA RECETA REAL
 * 1. Copia el objeto plantilla al final del array RECIPES.
 * 2. Completa solo datos verificados desde el post/reel original.
 * 3. Si un dato no está en la publicación: usa null, [] o "No especificado".
 * 4. Guarda la imagen en assets/images/ y referencia la ruta relativa.
 * 5. Pon isDemo: false (o elimínalo) y featured: true si quieres destacarla.
 *
 * CÓMO REEMPLAZAR DATOS DEMO
 * - Filtra o elimina cualquier objeto con isDemo: true.
 * - Busca el comentario "DEMO DATA" en este archivo.
 *
 * Instagram del creador: https://www.instagram.com/doctormussri
 * =============================================================================
 */

/** @typedef {'desayuno'|'almuerzo'|'cena'|'snack'|'postre'|'bebida'|'salsa'} MealType */

/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} title
 * @property {string} shortDescription
 * @property {MealType|string} category
 * @property {string} [subcategory]
 * @property {string[]} tags
 * @property {string[]} ingredients
 * @property {string[]} steps
 * @property {number|null} servings
 * @property {number|null} prepTime
 * @property {number|null} cookTime
 * @property {number|null} totalTime
 * @property {number|null} calories
 * @property {number|null} protein
 * @property {number|null} carbs
 * @property {number|null} fat
 * @property {string} image
 * @property {string} imageAlt
 * @property {string} instagramUrl
 * @property {string} datePublished
 * @property {boolean} featured
 * @property {boolean} [isDemo]  — marcar true SOLO para demos de interfaz
 * @property {string} [sourceNote]
 */

/** Plantilla para nuevas recetas (copiar y completar). */
const RECIPE_TEMPLATE = {
  id: "slug-de-la-receta",
  title: "",
  shortDescription: "",
  category: "desayuno",
  subcategory: "",
  tags: [],
  ingredients: [],
  steps: [],
  servings: null,
  prepTime: null,
  cookTime: null,
  totalTime: null,
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  image: "assets/images/",
  imageAlt: "",
  instagramUrl: "https://www.instagram.com/p/SHORTCODE/",
  datePublished: "YYYY-MM-DD",
  featured: false,
  isDemo: false,
  sourceNote: "Extraído del reel/post original de @doctormussri",
};

/**
 * Categorías disponibles en la UI (solo se muestran si hay recetas).
 * Agrega aquí nuevas claves cuando importes más contenido real.
 */
const CATEGORY_META = {
  desayuno: { label: "Desayunos", emoji: "🥣" },
  almuerzo: { label: "Almuerzos", emoji: "🥗" },
  cena: { label: "Cenas", emoji: "🍽️" },
  snack: { label: "Snacks", emoji: "🍎" },
  postre: { label: "Postres", emoji: "🍮" },
  bebida: { label: "Bebidas", emoji: "🥤" },
  salsa: { label: "Salsas", emoji: "🫙" },
};

/** Atajos de Home → filtros. */
const QUICK_PICKS = [
  { id: "rapido", label: "Algo rápido", filters: { traits: ["rapido"] } },
  { id: "dulce", label: "Algo dulce", filters: { traits: ["dulce"] } },
  { id: "pollo", label: "Algo con pollo", filters: { query: "pollo" } },
  { id: "desayuno", label: "Desayuno", filters: { meal: "desayuno" } },
  {
    id: "proteina",
    label: "Alto en proteína",
    filters: { traits: ["alto-proteina"] },
  },
];

/**
 * Filtros de características — solo se activan si alguna receta tiene el tag.
 * Clave = id del filtro, value = tag que debe existir en recipe.tags
 */
const TRAIT_FILTERS = [
  { id: "alto-proteina", label: "Alto en proteína", tag: "alto en proteína" },
  { id: "vegetariano", label: "Vegetariano", tag: "vegetariano" },
  { id: "facil", label: "Fácil", tag: "fácil" },
  { id: "pocos-ingredientes", label: "Pocos ingredientes", tag: "pocos ingredientes" },
  { id: "meal-prep", label: "Meal prep", tag: "meal prep" },
  { id: "dulce", label: "Dulce", tag: "dulce" },
  { id: "salado", label: "Salado", tag: "salado" },
  { id: "rapido", label: "Rápido", tag: "rápido" },
];

/** @type {Recipe[]} */
const RECIPES = [
  // ---------------------------------------------------------------------------
  // RECETA REAL — extraída del reel público de @doctormussri
  // Fuente: https://www.instagram.com/doctormussri/reel/Db9ypELOZDv/
  // Nota: tiempos y macros no publicados → null (no se inventan).
  // Los pasos se reconstruyen solo a partir del texto del caption.
  // ---------------------------------------------------------------------------
  {
    id: "avena-tostada-con-fruta",
    title: "Avena tostada con fruta",
    shortDescription:
      "Desayuno rápido, rico y con ciencia: avena tostada con fruta fresca y semillas.",
    category: "desayuno",
    subcategory: "avena",
    tags: ["rápido", "fácil", "dulce", "vegetariano", "fibra", "pocos ingredientes"],
    ingredients: [
      "1/2 taza de avena en hojuelas (instantánea)",
      "Semillas como chía o linaza (cantidad: No especificado)",
      "1 taza de leche favorita (de vaca o bebida vegetal: almendras, soya, avena)",
      "1 porción de fruta fresca (fresas, arándanos, plátano o manzana en cubos)",
      "Opcional: un toque de endulzante al gusto (miel, estevia)",
    ],
    steps: [
      "Tuesta la avena en hojuelas para mejorar sabor y textura (técnica completa en el reel).",
      "Prepara la avena con 1 taza de tu leche favorita.",
      "Agrega semillas de chía o linaza.",
      "Incorpora 1 porción de fruta fresca (fresas, arándanos, plátano o manzana en cubos).",
      "Si quieres, añade un toque de endulzante al gusto (miel o estevia).",
    ],
    servings: 1,
    prepTime: null,
    cookTime: null,
    totalTime: null,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    image: "assets/images/avena-tostada.jpg",
    imageAlt: "Avena tostada con fruta — captura del reel de Doctor Mussri",
    instagramUrl: "https://www.instagram.com/doctormussri/reel/Db9ypELOZDv/",
    datePublished: "2026-08-12",
    featured: true,
    isDemo: false,
    sourceNote:
      "Contenido publicado por @doctormussri. Consulta el reel para la técnica completa de tostado.",
  },

  // ===========================================================================
  // DEMO DATA — máximo 3 recetas de demostración de interfaz.
  // Eliminar fácilmente: busca "isDemo: true" o el marcador DEMO DATA.
  // NO son recetas reales de Doctor Mussri. No usar en propuesta final con datos reales.
  // ===========================================================================

  // DEMO DATA
  {
    id: "demo-bowl-yogur-berries",
    title: "[DEMO] Bowl de yogur y berries",
    shortDescription:
      "Ejemplo de interfaz: desayuno dulce, vegetariano y rápido. Reemplazar con receta real.",
    category: "desayuno",
    subcategory: "bowls",
    tags: ["rápido", "dulce", "vegetariano", "fácil", "pocos ingredientes"],
    ingredients: [
      "[DEMO] Yogur natural — cantidad No especificado",
      "[DEMO] Frutos rojos — cantidad No especificado",
      "[DEMO] Semillas — cantidad No especificado",
    ],
    steps: [
      "[DEMO] Paso de ejemplo 1 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 2 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 3 — completar con datos del reel original.",
    ],
    servings: null,
    prepTime: null,
    cookTime: null,
    totalTime: 10,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    image: "",
    imageAlt: "Placeholder demo — sin imagen real de receta",
    instagramUrl: "https://www.instagram.com/doctormussri/",
    datePublished: "2026-01-15",
    featured: true,
    isDemo: true,
    sourceNote: "DEMO DATA — eliminar al importar recetas reales.",
  },

  // DEMO DATA
  {
    id: "demo-pollo-limon-verduras",
    title: "[DEMO] Pollo al limón con verduras",
    shortDescription:
      "Ejemplo de interfaz: almuerzo salado alto en proteína. Reemplazar con receta real.",
    category: "almuerzo",
    subcategory: "pollo",
    tags: ["salado", "alto en proteína", "fácil", "meal prep"],
    ingredients: [
      "[DEMO] Pechuga de pollo — cantidad No especificado",
      "[DEMO] Limón — cantidad No especificado",
      "[DEMO] Verduras al gusto — cantidad No especificado",
      "[DEMO] Aceite de oliva — cantidad No especificado",
      "[DEMO] Sal y pimienta — al gusto",
    ],
    steps: [
      "[DEMO] Paso de ejemplo 1 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 2 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 3 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 4 — completar con datos del reel original.",
    ],
    servings: null,
    prepTime: null,
    cookTime: null,
    totalTime: 35,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    image: "",
    imageAlt: "Placeholder demo — sin imagen real de receta",
    instagramUrl: "https://www.instagram.com/doctormussri/",
    datePublished: "2025-11-20",
    featured: true,
    isDemo: true,
    sourceNote: "DEMO DATA — eliminar al importar recetas reales.",
  },

  // DEMO DATA
  {
    id: "demo-smoothie-verde",
    title: "[DEMO] Smoothie verde",
    shortDescription:
      "Ejemplo de interfaz: bebida rápida. Reemplazar con receta real de Instagram.",
    category: "bebida",
    subcategory: "smoothies",
    tags: ["rápido", "vegetariano", "fácil", "pocos ingredientes"],
    ingredients: [
      "[DEMO] Espinaca o kale — cantidad No especificado",
      "[DEMO] Plátano — cantidad No especificado",
      "[DEMO] Líquido (agua o leche vegetal) — cantidad No especificado",
    ],
    steps: [
      "[DEMO] Paso de ejemplo 1 — completar con datos del reel original.",
      "[DEMO] Paso de ejemplo 2 — completar con datos del reel original.",
    ],
    servings: 1,
    prepTime: null,
    cookTime: null,
    totalTime: 5,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    image: "",
    imageAlt: "Placeholder demo — sin imagen real de receta",
    instagramUrl: "https://www.instagram.com/doctormussri/",
    datePublished: "2025-09-01",
    featured: false,
    isDemo: true,
    sourceNote: "DEMO DATA — eliminar al importar recetas reales.",
  },
];

/** Perfil del creador (editable). */
const CREATOR = {
  handle: "@doctormussri",
  name: "Doctor Mussri",
  fullName: "Diego Mussri",
  instagramUrl: "https://www.instagram.com/doctormussri/",
  bio: "Médico en estilos de vida saludables. Tips de salud, nutrición y hábitos para tu día.",
  logo: "assets/logo/doctormussri.jpg",
};

// Expuesto globalmente para app.js (sin bundler / funciona abriendo index.html).
window.MussriData = {
  RECIPE_TEMPLATE,
  CATEGORY_META,
  QUICK_PICKS,
  TRAIT_FILTERS,
  RECIPES,
  CREATOR,
};

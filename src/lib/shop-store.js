import { dbGet, dbSet } from "./firebase-db.js";

const SEED = {
  categories: ["Piny", "Plakaty", "Torby"],
  products: [
    {
      id: "przypinka-jubileuszowa",
      name: "Przypinka Jubileuszowa",
      category: "Piny",
      description: "",
      images: ["/uploads/przypinka-jubileuszowa-1783882195317-0.png", "/uploads/przypinka-jubileuszowa-1783882577857-0.PNG"],
      variants: [
        { id: "wariant", color: "", size: "", price: 20, stock: 10 },
      ],
    },
    {
      id: "plakat-75",
      name: "Plakat 75",
      category: "Plakaty",
      description: "",
      images: ["/uploads/plakat-75-1783882615102-0.jpeg"],
      variants: [
        { id: "wariant", color: "", size: "", price: 10, stock: 20 },
      ],
    },
    {
      id: "torba",
      name: "Torba",
      category: "Torby",
      description: "",
      images: ["/uploads/torba-1783882691842-0.png"],
      variants: [
        { id: "wariant", color: "", size: "", price: 49, stock: 5 },
      ],
    },
  ],
};

const DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getStore() {
  try {
    const data = await dbGet("data");
    if (data) {
      return data;
    } else {
      // Pierwszą próbę inicjalizujemy seed'em
      await initializeStore();
      return SEED;
    }
  } catch (err) {
    console.error("Błąd podczas czytania z Firebase:", err);
    return structuredClone(SEED);
  }
}

async function initializeStore() {
  try {
    const existing = await dbGet("data");
    if (!existing) {
      await dbSet("data", SEED);
    }
  } catch (err) {
    console.error("Błąd podczas inicjalizacji bazy danych:", err);
    throw err;
  }
}

async function writeStore(store) {
  try {
    await dbSet("data", store);
  } catch (err) {
    console.error("Błąd podczas zapisu do Firebase:", err);
    throw new Error(`Nie udało się zapisać zmian do bazy danych: ${err.message}`);
  }
}

function normalizeVariants(rawVariants) {
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
    throw new Error("Produkt musi mieć co najmniej jeden wariant.");
  }
  const usedIds = new Set();
  return rawVariants.map((v) => {
    const color = (v.color || "").trim();
    const size = (v.size || "").trim();
    const price = Number(v.price);
    const stock = Number(v.stock);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Nieprawidłowa cena wariantu (${color || "?"} / ${size || "?"}).`);
    }
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error(`Nieprawidłowy stan magazynowy wariantu (${color || "?"} / ${size || "?"}).`);
    }
    const base = slugify([color, size].filter(Boolean).join("-")) || "wariant";
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    return { id, color, size, price, stock };
  });
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.filter((src) => typeof src === "string" && src.trim().length > 0);
}

function uniqueSlug(base, existingIds) {
  let slug = base || "produkt";
  let n = 2;
  while (existingIds.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function getAllProducts() {
  const store = await getStore();
  const products = store.products || [];
  return Array.isArray(products) ? products : Object.values(products);
}

export async function getProductById(id) {
  const store = await getStore();
  const products = store.products || [];
  const productArray = Array.isArray(products) ? products : Object.values(products);
  return productArray.find((p) => p.id === id);
}

export async function getCategories() {
  const store = await getStore();
  return store.categories || [];
}

export async function createProduct({ name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");

  const store = await getStore();
  const existingIds = new Set((store.products || []).map((p) => p.id));
  const id = uniqueSlug(slugify(name), existingIds);

  if (!store.categories.includes(category)) {
    store.categories.push(category);
  }

  const product = {
    id,
    name,
    category,
    description: (description || "").trim(),
    images: normalizeImages(images),
    variants: normalizeVariants(variants),
  };

  if (!Array.isArray(store.products)) {
    store.products = [];
  }
  store.products.push(product);
  await writeStore(store);
  return product;
}

export async function updateProduct(id, { name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");

  const store = await getStore();
  const products = Array.isArray(store.products) ? store.products : Object.values(store.products || {});
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error("Nie znaleziono produktu.");

  if (!store.categories.includes(category)) {
    store.categories.push(category);
  }

  product.name = name;
  product.category = category;
  product.description = (description || "").trim();
  product.images = normalizeImages(images);
  product.variants = normalizeVariants(variants);

  // Zaktualizuj produkty w store
  if (Array.isArray(store.products)) {
    store.products = store.products.map((p) => (p.id === id ? product : p));
  } else {
    store.products[id] = product;
  }

  await writeStore(store);
  return product;
}

export async function deleteProduct(id) {
  const store = await getStore();
  const before = (store.products || []).length;

  if (Array.isArray(store.products)) {
    store.products = store.products.filter((p) => p.id !== id);
  } else {
    delete store.products[id];
  }

  const after = Array.isArray(store.products) ? store.products.length : Object.keys(store.products).length;
  if (after === before) throw new Error("Nie znaleziono produktu.");

  await writeStore(store);
}

export async function createCategory(name) {
  name = (name || "").trim();
  if (!name) throw new Error("Nazwa kategorii jest wymagana.");
  const store = await getStore();
  if (store.categories.includes(name)) throw new Error("Taka kategoria już istnieje.");
  store.categories.push(name);
  await writeStore(store);
}

export async function renameCategory(oldName, newName) {
  newName = (newName || "").trim();
  if (!newName) throw new Error("Nazwa kategorii jest wymagana.");
  const store = await getStore();
  if (!store.categories.includes(oldName)) throw new Error("Nie znaleziono kategorii.");
  if (oldName !== newName && store.categories.includes(newName)) {
    throw new Error("Taka kategoria już istnieje.");
  }
  store.categories = store.categories.map((c) => (c === oldName ? newName : c));
  const products = Array.isArray(store.products) ? store.products : Object.values(store.products || {});
  products.forEach((p) => {
    if (p.category === oldName) p.category = newName;
  });
  await writeStore(store);
}

export async function deleteCategory(name) {
  const store = await getStore();
  const products = Array.isArray(store.products) ? store.products : Object.values(store.products || {});
  const inUse = products.some((p) => p.category === name);
  if (inUse) {
    throw new Error("Nie można usunąć kategorii, która ma przypisane produkty.");
  }
  const before = store.categories.length;
  store.categories = store.categories.filter((c) => c !== name);
  if (store.categories.length === before) throw new Error("Nie znaleziono kategorii.");
  await writeStore(store);
}

export async function getCategoryUsage() {
  const store = await getStore();
  const products = Array.isArray(store.products) ? store.products : Object.values(store.products || {});
  return store.categories.map((name) => ({
    name,
    count: products.filter((p) => p.category === name).length,
  }));
}

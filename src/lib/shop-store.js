import "server-only";
import { getDb } from "./firebase-db.js";

const STORE_PATH = "data";
const DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

export function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Firebase potrafi zwrócić tablicę jako obiekt (np. po usunięciu elementu) - normalizujemy.
export function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : Object.values(value).filter(Boolean);
}

function normalizeStore(raw) {
  const store = raw || {};
  return {
    ...store,
    categories: toArray(store.categories),
    products: toArray(store.products).map((p) => ({
      ...p,
      images: toArray(p.images),
      variants: toArray(p.variants),
    })),
  };
}

async function getStore() {
  const snapshot = await getDb().ref(STORE_PATH).get();
  return normalizeStore(snapshot.val());
}

/**
 * Atomowa modyfikacja sklepu (transakcja Realtime Database), żeby równoległe
 * zamówienia i zmiany w panelu nie nadpisywały się nawzajem.
 * `mutate` dostaje znormalizowany store, może go zmieniać i zwrócić wynik;
 * rzucony wyjątek przerywa transakcję i jest przekazywany dalej.
 */
export async function mutateStore(mutate) {
  let result;
  let error = null;
  let sawEmpty = false;

  const ref = getDb().ref(STORE_PATH);
  const { committed } = await ref.transaction((current) => {
    error = null;
    // Pierwsze wywołanie często dostaje null (brak lokalnej kopii) - oddajemy null,
    // a Firebase ponowi transakcję z prawdziwymi danymi z serwera.
    sawEmpty = current === null;
    if (sawEmpty) return null;
    const store = normalizeStore(current);
    try {
      result = mutate(store);
    } catch (err) {
      error = err;
      return; // undefined = przerwij transakcję
    }
    return store;
  });

  if (error) throw error;
  if (!committed) throw new Error("Nie udało się zapisać zmian - spróbuj ponownie.");

  if (sawEmpty) {
    // Baza naprawdę jest pusta (pierwsze uruchomienie) - zakładamy sklep od zera.
    const store = normalizeStore(null);
    result = mutate(store);
    await ref.set(store);
  }
  return result;
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
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Nieprawidłowa cena wariantu (${color || "?"} / ${size || "?"}).`);
    }
    if (!Number.isInteger(stock) || stock < 0) {
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
    return { id, color, size, price: Math.round(price * 100) / 100, stock };
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
  return store.products;
}

export async function getProductById(id) {
  const store = await getStore();
  return store.products.find((p) => p.id === id);
}

export async function getCategories() {
  const store = await getStore();
  return store.categories;
}

export async function createProduct({ name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");
  const normalizedVariants = normalizeVariants(variants);

  return mutateStore((store) => {
    const existingIds = new Set(store.products.map((p) => p.id));
    const product = {
      id: uniqueSlug(slugify(name), existingIds),
      name,
      category,
      description: (description || "").trim(),
      images: normalizeImages(images),
      variants: normalizedVariants,
    };
    if (!store.categories.includes(category)) store.categories.push(category);
    store.products.push(product);
    return product;
  });
}

export async function updateProduct(id, { name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");
  const normalizedVariants = normalizeVariants(variants);

  return mutateStore((store) => {
    const product = store.products.find((p) => p.id === id);
    if (!product) throw new Error("Nie znaleziono produktu.");
    if (!store.categories.includes(category)) store.categories.push(category);

    product.name = name;
    product.category = category;
    product.description = (description || "").trim();
    product.images = normalizeImages(images);
    product.variants = normalizedVariants;
    return product;
  });
}

export async function deleteProduct(id) {
  await mutateStore((store) => {
    const before = store.products.length;
    store.products = store.products.filter((p) => p.id !== id);
    if (store.products.length === before) throw new Error("Nie znaleziono produktu.");
  });
}

export async function createCategory(name) {
  name = (name || "").trim();
  if (!name) throw new Error("Nazwa kategorii jest wymagana.");
  await mutateStore((store) => {
    if (store.categories.includes(name)) throw new Error("Taka kategoria już istnieje.");
    store.categories.push(name);
  });
}

export async function renameCategory(oldName, newName) {
  newName = (newName || "").trim();
  if (!newName) throw new Error("Nazwa kategorii jest wymagana.");
  await mutateStore((store) => {
    if (!store.categories.includes(oldName)) throw new Error("Nie znaleziono kategorii.");
    if (oldName !== newName && store.categories.includes(newName)) {
      throw new Error("Taka kategoria już istnieje.");
    }
    store.categories = store.categories.map((c) => (c === oldName ? newName : c));
    store.products.forEach((p) => {
      if (p.category === oldName) p.category = newName;
    });
  });
}

export async function deleteCategory(name) {
  await mutateStore((store) => {
    if (store.products.some((p) => p.category === name)) {
      throw new Error("Nie można usunąć kategorii, która ma przypisane produkty.");
    }
    const before = store.categories.length;
    store.categories = store.categories.filter((c) => c !== name);
    if (store.categories.length === before) throw new Error("Nie znaleziono kategorii.");
  });
}

export async function getCategoryUsage() {
  const store = await getStore();
  return store.categories.map((name) => ({
    name,
    count: store.products.filter((p) => p.category === name).length,
  }));
}

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "shop.json");

// Seed startowy — dzisiejszy katalog sklepu, żeby nic nie zniknęło przy
// pierwszym uruchomieniu panelu admina (zanim powstanie data/shop.json).
const SEED = {
  categories: ["Koszulki", "Torby", "Kubki"],
  products: [
    {
      id: "koszulka-oversize-urban",
      name: "Koszulka Oversize Urban",
      category: "Koszulki",
      description:
        "Luźny krój oversize z krótkim rękawem, boczne szwy, kołnierzyk prążkowany 1x1. " +
        "100% bawełna stabilizowana, 200 g/m². Model unisex (JHK Urban Oversize).",
      images: ["/products/koszulka-navy.svg"],
      variants: [
        { id: "navy-xs", color: "Navy", size: "XS", price: 89, stock: 0 },
        { id: "navy-s", color: "Navy", size: "S", price: 89, stock: 0 },
        { id: "navy-m", color: "Navy", size: "M", price: 89, stock: 0 },
        { id: "navy-l", color: "Navy", size: "L", price: 89, stock: 0 },
        { id: "navy-xl", color: "Navy", size: "XL", price: 89, stock: 0 },
        { id: "navy-xxl", color: "Navy", size: "XXL", price: 89, stock: 1 },
        { id: "mocha-xs", color: "Mocha Mousse", size: "XS", price: 89, stock: 0 },
        { id: "mocha-s", color: "Mocha Mousse", size: "S", price: 89, stock: 0 },
        { id: "mocha-m", color: "Mocha Mousse", size: "M", price: 89, stock: 0 },
        { id: "mocha-l", color: "Mocha Mousse", size: "L", price: 89, stock: 2 },
        { id: "mocha-xl", color: "Mocha Mousse", size: "XL", price: 89, stock: 2 },
        { id: "mocha-xxl", color: "Mocha Mousse", size: "XXL", price: 89, stock: 0 },
        { id: "future-dark-xs", color: "Future Dark", size: "XS", price: 89, stock: 0 },
        { id: "future-dark-s", color: "Future Dark", size: "S", price: 89, stock: 0 },
        { id: "future-dark-m", color: "Future Dark", size: "M", price: 89, stock: 0 },
        { id: "future-dark-l", color: "Future Dark", size: "L", price: 89, stock: 2 },
        { id: "future-dark-xl", color: "Future Dark", size: "XL", price: 89, stock: 1 },
        { id: "future-dark-xxl", color: "Future Dark", size: "XXL", price: 89, stock: 0 },
      ],
    },
    {
      id: "koszulka-malfini-damska",
      name: "Koszulka Malfini Basic (damska)",
      category: "Koszulki",
      description:
        "Dopasowany, damski krój klasycznej koszulki klubowej. Model Malfini Basic 134.",
      images: ["/products/koszulka-zielen.svg"],
      variants: [
        { id: "zielen-xs", color: "Zieleń", size: "XS", price: 69, stock: 4 },
        { id: "zielen-s", color: "Zieleń", size: "S", price: 69, stock: 4 },
        { id: "zielen-m", color: "Zieleń", size: "M", price: 69, stock: 3 },
        { id: "zielen-l", color: "Zieleń", size: "L", price: 69, stock: 0 },
        { id: "roz-xs", color: "Róż", size: "XS", price: 69, stock: 4 },
        { id: "roz-s", color: "Róż", size: "S", price: 69, stock: 3 },
        { id: "roz-m", color: "Róż", size: "M", price: 69, stock: 1 },
        { id: "roz-l", color: "Róż", size: "L", price: 69, stock: 0 },
        { id: "szary-xs", color: "Szary", size: "XS", price: 69, stock: 5 },
        { id: "szary-s", color: "Szary", size: "S", price: 69, stock: 3 },
        { id: "szary-m", color: "Szary", size: "M", price: 69, stock: 2 },
        { id: "szary-l", color: "Szary", size: "L", price: 69, stock: 0 },
        { id: "niebieski-xs-d", color: "Niebieski", size: "XS", price: 69, stock: 5 },
        { id: "niebieski-s-d", color: "Niebieski", size: "S", price: 69, stock: 5 },
        { id: "niebieski-m-d", color: "Niebieski", size: "M", price: 69, stock: 1 },
        { id: "niebieski-l-d", color: "Niebieski", size: "L", price: 69, stock: 0 },
        { id: "military-xs-d", color: "Military", size: "XS", price: 69, stock: 5 },
        { id: "military-s-d", color: "Military", size: "S", price: 69, stock: 4 },
        { id: "military-m-d", color: "Military", size: "M", price: 69, stock: 2 },
        { id: "military-l-d", color: "Military", size: "L", price: 69, stock: 0 },
      ],
    },
    {
      id: "koszulka-malfini-unisex",
      name: "Koszulka Malfini Basic (męska/unisex)",
      category: "Koszulki",
      description:
        "Klasyczny, prosty krój unisex. Ten sam model co wersja damska, w kroju męskim. Model Malfini Basic.",
      images: ["/products/koszulka-niebieski.svg"],
      variants: [
        { id: "niebieski-xs-u", color: "Niebieski", size: "XS", price: 69, stock: 2 },
        { id: "niebieski-s-u", color: "Niebieski", size: "S", price: 69, stock: 1 },
        { id: "niebieski-m-u", color: "Niebieski", size: "M", price: 69, stock: 0 },
        { id: "niebieski-l-u", color: "Niebieski", size: "L", price: 69, stock: 0 },
        { id: "niebieski-xl-u", color: "Niebieski", size: "XL", price: 69, stock: 2 },
        { id: "niebieski-xxl-u", color: "Niebieski", size: "XXL", price: 69, stock: 1 },
        { id: "military-xs-u", color: "Military", size: "XS", price: 69, stock: 3 },
        { id: "military-s-u", color: "Military", size: "S", price: 69, stock: 3 },
        { id: "military-m-u", color: "Military", size: "M", price: 69, stock: 0 },
        { id: "military-l-u", color: "Military", size: "L", price: 69, stock: 0 },
        { id: "military-xl-u", color: "Military", size: "XL", price: 69, stock: 3 },
        { id: "military-xxl-u", color: "Military", size: "XXL", price: 69, stock: 1 },
      ],
    },
    {
      id: "koszulka-stary-wzor",
      name: "Koszulka klubowa — stary wzór",
      category: "Koszulki",
      description:
        "Ostatnie sztuki starszego wzoru koszulki klubowej (damska), dopóki starczy zapasów.",
      images: ["/products/koszulka-stara.svg"],
      variants: [{ id: "stara-s", color: "Damska", size: "S", price: 49, stock: 7 }],
    },
    {
      id: "torba-sportowa",
      name: "Torba sportowa KW",
      category: "Torby",
      description: "Pojemna torba na sprzęt wspinaczkowy, wodoodporny spód.",
      images: ["/products/torba-sportowa.svg"],
      variants: [{ id: "standard", color: "Czarna", size: "One size", price: 89, stock: 12 }],
    },
    {
      id: "worek-workout",
      name: "Worek na magnezję",
      category: "Torby",
      description: "Mały worek ze sznurkiem, z logo klubu.",
      images: ["/products/worek-workout.svg"],
      variants: [{ id: "standard", color: "Beżowy", size: "One size", price: 19, stock: 20 }],
    },
    {
      id: "kubek-ceramiczny",
      name: "Kubek ceramiczny KW Poznań",
      category: "Kubki",
      description: "Pojemność 350 ml, logo klubu z dwóch stron.",
      images: ["/products/kubek-ceramiczny.svg"],
      variants: [{ id: "standard", color: "Biały", size: "350 ml", price: 29, stock: 15 }],
    },
    {
      id: "kubek-termiczny",
      name: "Kubek termiczny na szlak",
      category: "Kubki",
      description: "Stalowy, izolowany kubek 450 ml — trzyma ciepło na wyjściach w góry.",
      images: ["/products/kubek-termiczny.svg"],
      variants: [{ id: "standard", color: "Zielony", size: "450 ml", price: 59, stock: 0 }],
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

function migrateLegacyImages(store) {
  let migrated = false;
  for (const product of store.products) {
    if (!Array.isArray(product.images)) {
      product.images = product.image ? [product.image] : [];
      delete product.image;
      migrated = true;
    }
  }
  return migrated;
}

function readStore() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED, null, 2), "utf-8");
    return structuredClone(SEED);
  }
  const store = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  if (migrateLegacyImages(store)) {
    writeStore(store);
  }
  return store;
}

function writeStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmpFile, DATA_FILE);
}

export function getAllProducts() {
  return readStore().products;
}

export function getProductById(id) {
  return readStore().products.find((p) => p.id === id);
}

export function getCategories() {
  return readStore().categories;
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

export function createProduct({ name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");

  const store = readStore();
  const existingIds = new Set(store.products.map((p) => p.id));
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
  store.products.push(product);
  writeStore(store);
  return product;
}

export function updateProduct(id, { name, category, description, images, variants }) {
  name = (name || "").trim();
  category = (category || "").trim();
  if (!name) throw new Error("Nazwa produktu jest wymagana.");
  if (!category) throw new Error("Kategoria jest wymagana.");

  const store = readStore();
  const product = store.products.find((p) => p.id === id);
  if (!product) throw new Error("Nie znaleziono produktu.");

  if (!store.categories.includes(category)) {
    store.categories.push(category);
  }

  product.name = name;
  product.category = category;
  product.description = (description || "").trim();
  product.images = normalizeImages(images);
  product.variants = normalizeVariants(variants);

  writeStore(store);
  return product;
}

export function deleteProduct(id) {
  const store = readStore();
  const before = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  if (store.products.length === before) throw new Error("Nie znaleziono produktu.");
  writeStore(store);
}

export function createCategory(name) {
  name = (name || "").trim();
  if (!name) throw new Error("Nazwa kategorii jest wymagana.");
  const store = readStore();
  if (store.categories.includes(name)) throw new Error("Taka kategoria już istnieje.");
  store.categories.push(name);
  writeStore(store);
}

export function renameCategory(oldName, newName) {
  newName = (newName || "").trim();
  if (!newName) throw new Error("Nazwa kategorii jest wymagana.");
  const store = readStore();
  if (!store.categories.includes(oldName)) throw new Error("Nie znaleziono kategorii.");
  if (oldName !== newName && store.categories.includes(newName)) {
    throw new Error("Taka kategoria już istnieje.");
  }
  store.categories = store.categories.map((c) => (c === oldName ? newName : c));
  store.products.forEach((p) => {
    if (p.category === oldName) p.category = newName;
  });
  writeStore(store);
}

export function deleteCategory(name) {
  const store = readStore();
  const inUse = store.products.some((p) => p.category === name);
  if (inUse) {
    throw new Error("Nie można usunąć kategorii, która ma przypisane produkty.");
  }
  const before = store.categories.length;
  store.categories = store.categories.filter((c) => c !== name);
  if (store.categories.length === before) throw new Error("Nie znaleziono kategorii.");
  writeStore(store);
}

export function getCategoryUsage() {
  const store = readStore();
  return store.categories.map((name) => ({
    name,
    count: store.products.filter((p) => p.category === name).length,
  }));
}

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "shop.json");

// Seed domyślny — produkty dostępne zawsze (zwłaszcza na Vercel z read-only FS).
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
  const isVercel = !!process.env.VERCEL;

  if (isVercel) {
    return structuredClone(SEED);
  }

  try {
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
  } catch (err) {
    return structuredClone(SEED);
  }
}

function writeStore(store) {
  if (process.env.VERCEL) {
    throw new Error("Admin panel na Vercel jest read-only. Edytuj produkty lokalnie i push'nij do GitHub.");
  }

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

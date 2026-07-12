"use server";

import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/lib/shop-store";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function slugifyBase(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(new RegExp("[̀-ͯ]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function saveUploadedImages(files, nameHint) {
  const realFiles = files.filter(
    (file) => file && typeof file.arrayBuffer === "function" && file.size > 0
  );
  if (realFiles.length === 0) return [];

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const base = slugifyBase(nameHint) || "produkt";
  const timestamp = Date.now();

  const paths = [];
  for (let i = 0; i < realFiles.length; i++) {
    const file = realFiles[i];
    const ext = path.extname(file.name || "") || ".jpg";
    const filename = `${base}-${timestamp}-${i}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
    paths.push(`/uploads/${filename}`);
  }
  return paths;
}

export async function saveProduct(prevState, formData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const category = formData.get("category");
  const description = formData.get("description");

  let variants;
  try {
    variants = JSON.parse(formData.get("variantsJson") || "[]");
  } catch {
    return { error: "Nieprawidłowe dane wariantów." };
  }

  let keepImages;
  try {
    keepImages = JSON.parse(formData.get("keepImagesJson") || "[]");
  } catch {
    return { error: "Nieprawidłowe dane zdjęć." };
  }

  let uploadedImages;
  try {
    uploadedImages = await saveUploadedImages(formData.getAll("newImages"), name);
  } catch {
    return { error: "Nie udało się zapisać zdjęć." };
  }

  const images = [...keepImages, ...uploadedImages];

  try {
    if (id) {
      updateProduct(id, { name, category, description, images, variants });
    } else {
      createProduct({ name, category, description, images, variants });
    }
  } catch (err) {
    return { error: err.message };
  }

  redirect("/admin/produkty");
}

export async function deleteProductAction(prevState, formData) {
  const id = formData.get("id");

  if (!id) {
    return { error: "Brakuje ID produktu." };
  }

  try {
    deleteProduct(id);
  } catch (err) {
    return { error: err.message || "Nie udało się usunąć produktu." };
  }

  redirect("/admin/produkty");
}

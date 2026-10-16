"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createProduct, updateProduct, deleteProduct, slugify } from "@/lib/shop-store";
import { saveProductImages } from "@/lib/uploads";

export async function saveProduct(prevState, formData) {
  await requireAdmin();

  const id = formData.get("id");
  const name = formData.get("name");
  const category = formData.get("category");
  const description = formData.get("description");

  let variants;
  let keepImages;
  try {
    variants = JSON.parse(formData.get("variantsJson") || "[]");
    keepImages = JSON.parse(formData.get("keepImagesJson") || "[]");
  } catch {
    return { error: "Nieprawidłowe dane formularza." };
  }

  let uploadedImages;
  try {
    uploadedImages = await saveProductImages(formData.getAll("newImages"), slugify(name || ""));
  } catch (err) {
    return { error: err.message || "Nie udało się zapisać zdjęć." };
  }

  const images = [...keepImages, ...uploadedImages];

  try {
    if (id) {
      await updateProduct(id, { name, category, description, images, variants });
    } else {
      await createProduct({ name, category, description, images, variants });
    }
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/sklep");
  redirect("/admin/produkty");
}

export async function deleteProductAction(prevState, formData) {
  await requireAdmin();

  const id = formData.get("id");
  if (!id) {
    return { error: "Brakuje ID produktu." };
  }

  try {
    await deleteProduct(id);
  } catch (err) {
    return { error: err.message || "Nie udało się usunąć produktu." };
  }

  revalidatePath("/sklep");
  redirect("/admin/produkty");
}

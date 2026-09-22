"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory as createCategoryInStore,
  renameCategory as renameCategoryInStore,
  deleteCategory as deleteCategoryInStore,
} from "@/lib/shop-store";
import { requireAdmin } from "@/lib/admin-guard";

export async function addCategoryAction(prevState, formData) {
  await requireAdmin();
  const name = formData.get("name");
  try {
    await createCategoryInStore(name);
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath("/admin/kategorie");
  return { error: null };
}

export async function renameCategoryAction(oldName, prevState, formData) {
  await requireAdmin();
  const newName = formData.get("name");
  try {
    await renameCategoryInStore(oldName, newName);
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath("/admin/kategorie");
  return { error: null, done: true };
}

export async function deleteCategoryAction(name, prevState) {
  await requireAdmin();
  try {
    await deleteCategoryInStore(name);
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath("/admin/kategorie");
  return { error: null };
}

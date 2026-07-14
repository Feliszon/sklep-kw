"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory as createCategoryInStore,
  renameCategory as renameCategoryInStore,
  deleteCategory as deleteCategoryInStore,
} from "@/lib/shop-store";

export async function addCategoryAction(prevState, formData) {
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
  try {
    await deleteCategoryInStore(name);
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath("/admin/kategorie");
  return { error: null };
}

"use server";

import { getAllProducts } from "./shop-store";

const MAX_KEYS = 100;

/**
 * Zwraca aktualną cenę i stan dla pozycji koszyka.
 * keys: ["productId:variantId", ...] -> { "productId:variantId": { price, stock } | null }
 */
export async function getCurrentVariants(keys) {
  if (!Array.isArray(keys)) return {};
  const wanted = keys.filter((k) => typeof k === "string").slice(0, MAX_KEYS);

  const products = await getAllProducts();
  const result = {};
  for (const key of wanted) {
    const [productId, variantId] = key.split(":");
    const variant = products
      .find((p) => p.id === productId)
      ?.variants?.find((v) => v.id === variantId);
    result[key] = variant ? { price: variant.price, stock: variant.stock } : null;
  }
  return result;
}

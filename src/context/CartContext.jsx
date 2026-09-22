"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kw-sklep-cart";
const EMPTY = [];

// Koszyk żyje w localStorage; React czyta go przez useSyncExternalStore,
// więc nie ma setState w efekcie ani rozjazdu przy hydratacji (serwer widzi pusty koszyk).
let cache = null;
const listeners = new Set();

function readCart() {
  if (cache === null) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      cache = saved ? JSON.parse(saved) : EMPTY;
    } catch (e) {
      console.error("Nie udało się wczytać koszyka:", e);
      cache = EMPTY;
    }
  }
  return cache;
}

function writeCart(next) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Nie udało się zapisać koszyka:", e);
  }
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  // Zmiana koszyka w innej karcie przeglądarki
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(fn) {
  writeCart(fn(readCart()));
}

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);

  function addItem(newItem) {
    update((prev) => {
      const existing = prev.find(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, qty: Math.min(i.qty + newItem.qty, newItem.maxStock) } : i
        );
      }
      return [...prev, newItem];
    });
  }

  function updateQty(productId, variantId, qty) {
    update((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.variantId === variantId ? { ...i, qty } : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(productId, variantId) {
    update((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  }

  function clearCart() {
    writeCart(EMPTY);
  }

  /**
   * Nadpisuje cenę/stan pozycji aktualnymi danymi z serwera.
   * `current` to mapa "productId:variantId" -> { price, stock } albo null (produkt usunięty).
   * Zwraca listę opisów zmian do pokazania klientowi.
   */
  function applyServerData(current) {
    const changes = [];
    update((prev) =>
      prev.flatMap((i) => {
        const fresh = current[`${i.productId}:${i.variantId}`];
        const label = [i.name, i.variantLabel].filter(Boolean).join(" – ");
        if (!fresh || fresh.stock <= 0) {
          changes.push(`${label}: produkt jest już niedostępny i został usunięty z koszyka.`);
          return [];
        }
        let next = i;
        if (fresh.price !== i.price) {
          changes.push(`${label}: cena zmieniła się z ${i.price} zł na ${fresh.price} zł.`);
          next = { ...next, price: fresh.price };
        }
        if (i.qty > fresh.stock) {
          changes.push(`${label}: dostępnych jest tylko ${fresh.stock} szt., zmniejszyliśmy ilość.`);
          next = { ...next, qty: fresh.stock };
        }
        if (fresh.stock !== i.maxStock) next = { ...next, maxStock: fresh.stock };
        return [next];
      })
    );
    return changes;
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, applyServerData, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart musi być użyte wewnątrz CartProvider");
  return ctx;
}

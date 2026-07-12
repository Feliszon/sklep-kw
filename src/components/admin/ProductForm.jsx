"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/(panel)/produkty/actions";
import ImageLightbox from "@/components/ImageLightbox";

const NEW_CATEGORY_VALUE = "__new__";
const KW_GREEN = "#8DC63F";

function emptyVariant() {
  return { key: crypto.randomUUID(), color: "", size: "", price: "", stock: "" };
}

function emptyImageRow() {
  return { key: crypto.randomUUID(), previewUrl: "" };
}

export default function ProductForm({ mode, product, categories }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);

  const [categoryMode, setCategoryMode] = useState("existing");
  const [variants, setVariants] = useState(() =>
    product?.variants?.length
      ? product.variants.map((v) => ({ key: crypto.randomUUID(), ...v }))
      : [emptyVariant()]
  );
  const [existingImages, setExistingImages] = useState(() => product?.images || []);
  const [newImageRows, setNewImageRows] = useState(() => [emptyImageRow()]);
  const [lightboxSrc, setLightboxSrc] = useState("");

  function updateVariant(key, field, value) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(key) {
    setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v.key !== key) : prev));
  }

  function removeExistingImage(url) {
    setExistingImages((prev) => prev.filter((src) => src !== url));
  }

  function addImageRow() {
    setNewImageRows((prev) => [...prev, emptyImageRow()]);
  }

  function removeImageRow(key) {
    setNewImageRows((prev) => prev.filter((r) => r.key !== key));
  }

  function handleNewImageChange(key, e) {
    const file = e.target.files?.[0];
    setNewImageRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, previewUrl: file ? URL.createObjectURL(file) : "" } : r))
    );
  }

  const variantsJson = JSON.stringify(
    variants.map(({ color, size, price, stock }) => ({ color, size, price, stock }))
  );
  const keepImagesJson = JSON.stringify(existingImages);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {mode === "edit" && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variantsJson" value={variantsJson} />
      <input type="hidden" name="keepImagesJson" value={keepImagesJson} />
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc("")} />

      {state?.error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Field label="Nazwa produktu">
            <input
              name="name"
              required
              defaultValue={product?.name}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </Field>

          <Field label="Kategoria">
            {categoryMode === "existing" ? (
              <select
                name="category"
                defaultValue={product?.category}
                onChange={(e) => {
                  if (e.target.value === NEW_CATEGORY_VALUE) setCategoryMode("new");
                }}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={NEW_CATEGORY_VALUE}>+ Nowa kategoria…</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  name="category"
                  required
                  autoFocus
                  placeholder="Nazwa nowej kategorii"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCategoryMode("existing")}
                  className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-black"
                >
                  Anuluj
                </button>
              </div>
            )}
          </Field>

          <Field label="Opis">
            <textarea
              name="description"
              rows={5}
              defaultValue={product?.description}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Zdjęcia">
            <div className="flex flex-col gap-3">
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url) => (
                    <div key={url} className="relative h-24 w-24 shrink-0">
                      <button
                        type="button"
                        onClick={() => setLightboxSrc(url)}
                        className="h-full w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        aria-label="Usuń zdjęcie"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {newImageRows.map((row) => (
                  <div key={row.key} className="relative h-24 w-24 shrink-0">
                    <label className="block h-full w-full cursor-pointer" title="Kliknij, aby wybrać zdjęcie">
                      <input
                        name="newImages"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleNewImageChange(row.key, e)}
                        className="sr-only"
                      />
                      {row.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.previewUrl}
                          alt=""
                          className="h-full w-full rounded-lg border border-neutral-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-center text-[11px] text-neutral-400 transition hover:border-black hover:text-neutral-600">
                          + Dodaj
                        </div>
                      )}
                    </label>
                    {row.previewUrl && (
                      <button
                        type="button"
                        onClick={() => removeImageRow(row.key)}
                        aria-label="Usuń zdjęcie"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white shadow"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addImageRow}
                className="w-fit rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:border-black hover:text-black"
              >
                + Kolejne zdjęcie
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Warianty (kolor / rozmiar / cena / stan)
        </p>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_100px_100px_auto] gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <span>Kolor</span>
            <span>Rozmiar</span>
            <span>Cena (zł)</span>
            <span>Stan</span>
            <span />
          </div>
          {variants.map((v) => (
            <div key={v.key} className="grid grid-cols-[1fr_1fr_100px_100px_auto] gap-2">
              <input
                value={v.color}
                onChange={(e) => updateVariant(v.key, "color", e.target.value)}
                placeholder="np. Navy"
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
              />
              <input
                value={v.size}
                onChange={(e) => updateVariant(v.key, "size", e.target.value)}
                placeholder="np. M / One size"
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={v.price}
                onChange={(e) => updateVariant(v.key, "price", e.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={v.stock}
                onChange={(e) => updateVariant(v.key, "stock", e.target.value)}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeVariant(v.key)}
                disabled={variants.length === 1}
                className="rounded-md px-2 text-xs font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:border-black hover:text-black"
        >
          + Dodaj wariant
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: KW_GREEN }}
        >
          {pending ? "Zapisywanie…" : mode === "edit" ? "Zapisz zmiany" : "Dodaj produkt"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

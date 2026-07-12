"use client";

import { useEffect } from "react";

export default function ImageLightbox({ src, alt = "", onClose }) {
  useEffect(() => {
    if (!src) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Zamknij podgląd"
      onClick={onClose}
      className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/85 p-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Zamknij"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
      >
        ×
      </button>
    </div>
  );
}

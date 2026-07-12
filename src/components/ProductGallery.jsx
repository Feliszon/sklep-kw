"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

export default function ProductGallery({ images, alt }) {
  const gallery = images?.length ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (gallery.length === 0) {
    return <div className="h-full w-full bg-neutral-100" />;
  }

  const activeSrc = gallery[activeIndex] || gallery[0];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </button>

      {gallery.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 transition ${
                i === activeIndex ? "ring-2 ring-black" : "ring-neutral-200 hover:ring-neutral-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox src={activeSrc} alt={alt} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

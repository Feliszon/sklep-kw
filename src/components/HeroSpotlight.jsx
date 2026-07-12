"use client";

import { useRef } from "react";

export default function HeroSpotlight() {
  const ref = useRef(null);

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="pointer-events-auto absolute inset-0"
      style={{
        background:
          "radial-gradient(500px circle at var(--spot-x, 30%) var(--spot-y, 0%), rgba(141,198,63,0.16), transparent 70%)",
      }}
    />
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sklep?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/sklep");
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/sklep");
  };

  return (
    <form onSubmit={handleSearch} className="mb-8 flex gap-2">
      <input
        type="text"
        placeholder="Szukaj produktów..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-[#8DC63F] text-white rounded-lg text-sm font-semibold hover:bg-[#7ab332] transition"
      >
        Szukaj
      </button>
      {currentQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-3 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition"
        >
          Wyczyść
        </button>
      )}
    </form>
  );
}

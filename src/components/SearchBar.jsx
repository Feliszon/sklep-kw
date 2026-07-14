"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);
  const [isFocused, setIsFocused] = useState(false);

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
    <form onSubmit={handleSearch} className="mb-12 w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <svg
          className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          type="text"
          placeholder="Wpisz nazwę produktu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-12 pr-4 py-3 text-sm bg-white border rounded-lg transition-all duration-200 ${
            isFocused
              ? "border-[#8DC63F] ring-2 ring-[#8DC63F] ring-opacity-10 shadow-lg"
              : "border-neutral-200 hover:border-neutral-300"
          } focus:outline-none`}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 p-1 text-neutral-400 hover:text-neutral-600 transition"
            aria-label="Wyczyść wyszukiwanie"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-[#8DC63F] text-white text-sm font-medium rounded transition-all duration-200 hover:bg-[#7ab332] active:scale-95"
          aria-label="Szukaj"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Search Tips */}
      {!query && (
        <p className="mt-2 text-xs text-neutral-500 text-center">
          Szukaj po nazwie produktu
        </p>
      )}
    </form>
  );
}

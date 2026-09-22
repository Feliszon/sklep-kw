// Publiczny adres sklepu - używany w metadanych, sitemapie i robots.txt.
// Na produkcji ustaw NEXT_PUBLIC_SITE_URL (np. https://sklep.kw.poznan.pl).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

// Publiczny adres sklepu - używany w metadanych, sitemapie, robots.txt, linkach P24 i mailach.
// Na produkcji ustaw SITE_URL (np. https://sklep.kw.poznan.pl).
export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

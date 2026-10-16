import { getAllProducts } from "@/lib/shop-store";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const products = await getAllProducts().catch(() => []);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sklep`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/produkt/${p.id}`, changeFrequency: "weekly", priority: 0.7 })),
    { url: `${base}/regulamin`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/polityka-prywatnosci`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

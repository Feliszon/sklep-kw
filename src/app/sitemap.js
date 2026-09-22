import { getAllProducts } from "@/lib/shop-store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const products = await getAllProducts();
  return [
    { url: `${SITE_URL}/sklep`, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${SITE_URL}/produkt/${p.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    { url: `${SITE_URL}/regulamin`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/polityka-prywatnosci`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

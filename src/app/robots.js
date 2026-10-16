export default function robots() {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/kasa", "/koszyk", "/platnosc"] },
    sitemap: `${base}/sitemap.xml`,
  };
}

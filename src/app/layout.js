import "./globals.css";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GrainOverlay from "@/components/GrainOverlay";
import { SITE_URL } from "@/lib/site";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sklep KW Poznań",
    template: "%s | Sklep KW Poznań",
  },
  description: "Koszulki, torby i akcesoria z logo Klubu Wysokogórskiego w Poznaniu.",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Sklep KW Poznań",
    images: ["/logo-kw.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pl"
      className={`${oswald.variable} ${inter.variable} ${plexMono.variable}`}
      style={{ colorScheme: "light" }}
    >
      <body
        className="flex min-h-screen flex-col font-[family-name:var(--font-body)] antialiased"
        style={{ backgroundColor: "#FAFAF7", color: "#14140F" }}
      >
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in { animation: fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
          a:focus-visible, button:focus-visible, select:focus-visible {
            outline: 2px solid #8DC63F;
            outline-offset: 2px;
            border-radius: 4px;
          }
        `}</style>
        <GrainOverlay />
        <CartProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
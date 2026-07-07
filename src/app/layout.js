import "./globals.css";
import { Oswald, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import SiteHeader from "@/components/SiteHeader";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export const metadata = {
  title: "Sklep KW Poznań",
  description: "Sklep z gadżetami Klubu Wysokogórskiego Poznań",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-[family-name:var(--font-body)] antialiased">
        <CartProvider>
          <SiteHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

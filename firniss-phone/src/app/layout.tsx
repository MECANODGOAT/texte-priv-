import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "firniss.phone · Votre iPhone à petit prix",
  description: "iPhone neufs et reconditionnés, du 11 au 18 Pro Max. Livraison au Maroc et au Gabon, paiement par mobile money.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- polices chargées une fois pour tout le site */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Figtree:wght@400;500;600;700&family=Geist+Mono:wght@400;600&display=swap"
        />
      </head>
      <body>
        <CartProvider>
          <div className="aurora" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="wrap">
            <Header />
            {children}
            <footer>
              <span>© {new Date().getFullYear()} firniss.phone</span>
              <span>Revendeur indépendant, non affilié à Apple Inc. iPhone est une marque d&apos;Apple Inc.</span>
            </footer>
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

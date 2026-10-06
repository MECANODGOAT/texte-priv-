import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import Announce from "@/components/Announce";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { collections } from "@/lib/catalog";
import "./globals.css";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Dimension — Streetwear premium au Maroc", template: "%s · Dimension" },
  description: "Dimension BTE, marque streetwear premium : t-shirts oversize, sweats et collections en drops limités. Livraison offerte dès 500 DH partout au Maroc.",
  // Maquette de démonstration : pas d'indexation.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip">Aller au contenu</a>
        <Providers>
          <Announce />
          <Header />
          <main id="main">{children}</main>
          <Footer collections={collections} />
          <a className="wa" href="https://wa.me/212688640423" aria-label="Nous écrire sur WhatsApp" rel="noopener">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
          </a>
        </Providers>
      </body>
    </html>
  );
}

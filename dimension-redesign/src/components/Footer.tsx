import Image from "next/image";
import Link from "next/link";
import { LOGO } from "./Header";
import type { Collection } from "@/lib/catalog";

const SHOP = "https://dimensionbte.com";

export default function Footer({ collections }: { collections: Collection[] }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Image src={LOGO} alt="Dimension" width={160} height={42} />
            <p>Streetwear éthique, original et accessible. Une esthétique forte pour exprimer librement votre identité.</p>
          </div>
          <div>
            <h4>Collections</h4>
            <ul>{collections.map((c) => <li key={c.slug}><Link href={`/collection/${c.slug}`}>{c.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Aide</h4>
            <ul>
              <li><a href={`${SHOP}/contact/`}>Contact</a></li>
              <li><a href={`${SHOP}/politique-de-livraison/`}>Livraison</a></li>
              <li><a href={`${SHOP}/mode-de-paiement/`}>Paiement</a></li>
              <li><a href={`${SHOP}/engagement-qualite/`}>Engagement qualité</a></li>
              <li><a href={`${SHOP}/politique-de-confidentialite/`}>Confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4>Suivre</h4>
            <ul>
              <li><a href="https://www.instagram.com/dimension_beyond_the_extreme/" rel="noopener">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@dimensionbte" rel="noopener">TikTok</a></li>
              <li><a href="https://web.facebook.com/dimensionbeyondtheextreme" rel="noopener">Facebook</a></li>
              <li><a href="https://www.youtube.com/@dimension-beyondtheextreme6703" rel="noopener">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-big" aria-hidden>Dimension</div>
        <div className="footer-bottom">
          <span>© 2026 Dimension — Beyond the extreme</span>
          <span>Maquette de refonte — démonstration</span>
        </div>
      </div>
    </footer>
  );
}

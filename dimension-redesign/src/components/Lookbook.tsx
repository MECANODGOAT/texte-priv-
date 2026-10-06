import CoverflowCarousel from "./CoverflowCarousel";
import Reveal from "./Reveal";
import type { Product } from "@/lib/catalog";

// Photos portées en carrousel 3D ; la légende mène à la pièce portée.
export default function Lookbook({ items }: { items: Product[] }) {
  const looks = items
    .flatMap((p) => p.lifestyle.slice(0, 2).map((src, i) => ({
      id: `${p.id}-${i}`,
      image: src,
      alt: `${p.name} porté`,
      caption: p.name,
      href: `/produit/${p.slug}`,
    })))
    .slice(0, 12);
  return (
    <section id="lookbook" className="section" aria-labelledby="look-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="kicker">Shop the style</span>
            <h2 id="look-title">Lookbook</h2>
          </div>
          <p>Les pièces portées dans la rue. Faites glisser, utilisez les flèches ou touchez une photo.</p>
        </Reveal>
        <CoverflowCarousel items={looks} label="Lookbook : photos portées" autoplay />
      </div>
    </section>
  );
}

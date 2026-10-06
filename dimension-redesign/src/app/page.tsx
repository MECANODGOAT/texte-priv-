import Bento from "@/components/Bento";
import Drops from "@/components/Drops";
import Hero from "@/components/Hero";
import Lookbook from "@/components/Lookbook";
import Newsletter from "@/components/Newsletter";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import Ticker from "@/components/Ticker";
import { collections, products, sorted } from "@/lib/catalog";

export default function Home() {
  const list = sorted(products);
  // Pièce mise en avant : la plus récente en stock disposant d'une vue de dos.
  const featured = list.find((p) => p.inStock && p.back) ?? list[0];
  const recent = list.filter((p) => p.collection === "zenith" || p.collection === "univer" || p.collection === "polar-mode");

  return (
    <>
      <Hero product={featured} total={products.length} />
      <Ticker />
      <section id="nouveautes" className="section" aria-labelledby="new-title">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <span className="kicker">Nouveautés</span>
              <h2 id="new-title">Le vestiaire</h2>
            </div>
            <p>Survolez une pièce pour la retourner, ouvrez-la pour la faire tourner à 360°.</p>
          </Reveal>
          <ProductGrid items={list} limit={8} />
        </div>
      </section>
      <Drops collections={collections} />
      <Lookbook items={recent.length ? recent : list} />
      <Bento />
      <Newsletter />
    </>
  );
}

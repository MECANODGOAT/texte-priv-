import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import type { Product } from "@/lib/catalog";

// Photos portées défilantes ; chaque photo mène à la pièce portée.
export default function Lookbook({ items }: { items: Product[] }) {
  const looks = items.flatMap((p) => p.lifestyle.slice(0, 2).map((src) => ({ src, p }))).slice(0, 12);
  const row = (hidden: boolean) => looks.map(({ src, p }, i) => (
    <Link key={`${src}-${i}`} href={`/produit/${p.slug}`} className="look" tabIndex={hidden ? -1 : undefined} aria-hidden={hidden || undefined}>
      <Image src={src} alt={hidden ? "" : `${p.name} porté`} fill sizes="300px" />
      <span>{p.name} →</span>
    </Link>
  ));
  return (
    <section id="lookbook" className="section" aria-labelledby="look-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="kicker">Shop the style</span>
            <h2 id="look-title">Lookbook</h2>
          </div>
          <p>Les pièces portées dans la rue, au soleil de Casablanca. Survolez pour mettre en pause.</p>
        </Reveal>
      </div>
      <div className="lookbook">
        <div className="marquee"><div>{row(false)}</div><div>{row(true)}</div></div>
      </div>
    </section>
  );
}

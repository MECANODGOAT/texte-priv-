import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "@/components/BuyBox";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import Viewer360 from "@/components/Viewer360";
import { collectionName, getProduct, products, related } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.description.slice(0, 160) } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const more = related(p);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Fil d’Ariane">
        <Link href="/">Accueil</Link><span aria-hidden>/</span>
        {p.collection && <><Link href={`/collection/${p.collection}`}>{collectionName(p.collection)}</Link><span aria-hidden>/</span></>}
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp-media">
          <Viewer360 front={p.front.cutout} back={p.back?.cutout} alt={p.name} priority />
          {p.lifestyle.length > 0 && (
            <div className="pdp-gallery">
              {p.lifestyle.slice(0, 4).map((src, i) => (
                <Reveal key={src} delay={i * 0.06}>
                  <figure><Image src={src} alt={`${p.name} porté, photo ${i + 1}`} fill sizes="(max-width: 900px) 45vw, 25vw" /></figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>
        <BuyBox p={p} />
      </div>

      {more.length > 0 && (
        <section className="section" aria-labelledby="more-title">
          <Reveal className="section-head">
            <div>
              <span className="kicker">Même collection</span>
              <h2 id="more-title">À porter avec</h2>
            </div>
          </Reveal>
          <ul className="grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {more.map((x, i) => <Reveal as="li" key={x.id} delay={i * 0.06}><ProductCard p={x} /></Reveal>)}
          </ul>
        </section>
      )}
    </div>
  );
}

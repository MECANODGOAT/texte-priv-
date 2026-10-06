import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { collections, products, sorted } from "@/lib/catalog";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = collections.find((x) => x.slug === slug);
  return c ? { title: `Collection ${c.name}` } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = collections.find((x) => x.slug === slug);
  if (!c) notFound();
  const items = sorted(products.filter((p) => p.collection === slug));

  return (
    <div className="wrap">
      <section className="collection-hero">
        {c.poster && (
          <div className="collection-poster">
            <Image src={c.poster} alt={`Affiche de la collection ${c.name}`} fill sizes="(max-width: 900px) 100vw, 40vw" priority />
          </div>
        )}
        <Reveal>
          <span className="kicker">Collection · {items.length} pièces</span>
          <h1>{c.name}</h1>
        </Reveal>
      </section>
      <ProductGrid items={items} />
    </div>
  );
}

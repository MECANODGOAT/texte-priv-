import Image from "next/image";
import Link from "next/link";
import { collectionName, formatPrice, isOnSale, KIND_LABEL, type Product } from "@/lib/catalog";

export default function ProductCard({ p, priority }: { p: Product; priority?: boolean }) {
  const off = isOnSale(p) ? Math.round((1 - p.price / p.regularPrice) * 100) : 0;
  const sizes = "(max-width: 900px) 50vw, 25vw";
  return (
    <Link href={`/produit/${p.slug}`} className={`card ${p.inStock ? "" : "is-out"}`}>
      <div className="card-stage">
        <div className="card-badges">
          {!p.inStock ? <span className="badge">Épuisé</span> : off > 0 ? <span className="badge badge-red">-{off}%</span> : null}
          {p.back && <span className="badge badge-360">360°</span>}
        </div>
        {/* Sans vue de dos, le survol révèle une photo portée. */}
        {!p.back && p.lifestyle[0] && (
          <div className="card-life"><Image src={p.lifestyle[0]} alt="" fill sizes={sizes} /></div>
        )}
        <div className={`card-flip ${p.back ? "has-back" : ""}`}>
          <div><Image src={p.front.cutout} alt={p.name} fill sizes={sizes} priority={priority} /></div>
          {p.back && <div className="card-back"><Image src={p.back.cutout} alt="" fill sizes={sizes} /></div>}
        </div>
        <span className="card-cta" aria-hidden>{p.inStock ? "Voir en 360°" : "Voir la pièce"}</span>
      </div>
      <div className="card-info">
        <div>
          <h3>{p.name}</h3>
          <small>{KIND_LABEL[p.kind]} · {collectionName(p.collection)}</small>
        </div>
        <p className="price">
          {off > 0 && <s>{formatPrice(p.regularPrice)}</s>}
          <span className={off > 0 ? "now" : undefined}>{formatPrice(p.price)}</span>
        </p>
      </div>
    </Link>
  );
}

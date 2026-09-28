"use client";

import { useMemo, useState } from "react";
import { formatMoney, goLabel, toLocal, type Product } from "@/lib/catalog";
import { useCart } from "./CartProvider";
import { Phone3D } from "./Phone3D";

type Filter = "all" | "pro" | "std" | "neuf" | "recond";
type Sort = "gen-desc" | "gen-asc" | "price-asc" | "price-desc";

const FILTERS: [Filter, string][] = [
  ["all", "Tous"],
  ["pro", "Pro & Pro Max"],
  ["std", "Classiques"],
  ["neuf", "Neufs"],
  ["recond", "Reconditionnés"],
];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

// Rang pour trier du plus récent au plus ancien : génération, puis Pro Max > Pro > classique.
const rank = (p: Product) => p.generation * 10 + (p.isPro ? (p.name.endsWith("Max") ? 2 : 1) : 0);

export function Catalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("gen-desc");

  const list = useMemo(() => {
    const l = products.filter(
      (p) =>
        filter === "all" ||
        (filter === "pro" && p.isPro) ||
        (filter === "std" && !p.isPro) ||
        p.condition === filter,
    );
    const minPrice = (p: Product) => Math.min(...p.storage.map((s) => s.price));
    return l.sort(
      {
        "gen-desc": (a: Product, b: Product) => rank(b) - rank(a),
        "gen-asc": (a: Product, b: Product) => rank(a) - rank(b),
        "price-asc": (a: Product, b: Product) => minPrice(a) - minPrice(b),
        "price-desc": (a: Product, b: Product) => minPrice(b) - minPrice(a),
      }[sort],
    );
  }, [products, filter, sort]);

  return (
    <section id="catalogue">
      <div className="shead">
        <div>
          <h2>Le catalogue</h2>
          <p>Cliquez sur une couleur pour voir le téléphone changer. Survolez une carte pour le faire pivoter.</p>
        </div>
      </div>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrer les modèles">
          {FILTERS.map(([f, label]) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {label}
            </button>
          ))}
        </div>
        <label className="sort" htmlFor="sort">
          Trier
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="gen-desc">Plus récents</option>
            <option value="gen-asc">Plus anciens</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </label>
      </div>
      <div className="grid">
        {list.length ? list.map((p) => <ProductCard key={p.id} product={p} />) : <p className="empty">Aucun modèle ne correspond à ce filtre.</p>}
      </div>
    </section>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const { add, currency } = useCart();
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [tilt, setTilt] = useState<{ ry: number; rx: number; sheen: number } | null>(null);
  const [added, setAdded] = useState(false);
  const color = p.colors[ci] ?? p.colors[0];
  const option = p.storage[si] ?? p.storage[0];
  const price = toLocal(option.price, currency);
  const outOfStock = p.stock <= 0;

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ ry: 180 + x * 70, rx: -y * 30, sheen: x * 90 });
  }

  return (
    <article
      className={`card ${outOfStock ? "out" : ""}`}
      style={{ "--glow": hexA(color.hex, 0.5) } as React.CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt(null)}
    >
      <div className="badges">
        {p.isNew && <span className="badge new">Nouveau</span>}
        <span className="badge">{p.condition === "neuf" ? "Neuf" : "Reconditionné A"}</span>
      </div>
      {color.image ? (
        <div className="photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- photos hébergées sur Supabase, taille libre */}
          <img src={color.image} alt={`${p.name} ${color.name}`} loading="lazy" />
        </div>
      ) : (
        <div className="scene">
          <Phone3D
            color={color.hex}
            camera={p.camera}
            hasIsland={p.hasIsland}
            style={
              {
                "--ry": `${tilt?.ry ?? 155}deg`,
                "--rx": `${tilt?.rx ?? 6}deg`,
                "--sheen": `${tilt?.sheen ?? -30}%`,
              } as React.CSSProperties
            }
          />
        </div>
      )}
      <div>
        <h3>{p.name}</h3>
        <div className="meta">{p.isPro ? "Triple capteur · écran ProMotion" : "Double capteur · écran OLED"}</div>
      </div>
      <div>
        <div className="swatches">
          {p.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="sw"
              style={{ backgroundColor: c.hex }}
              aria-label={c.name}
              title={c.name}
              aria-pressed={i === ci}
              onClick={() => setCi(i)}
            />
          ))}
        </div>
        <div className="cname">{color.name}</div>
      </div>
      <div className="storage" role="group" aria-label="Capacité">
        {p.storage.map((s, i) => (
          <button key={s.go} type="button" className="st" aria-pressed={i === si} onClick={() => setSi(i)}>
            {goLabel(s.go)}
          </button>
        ))}
      </div>
      <div className="buy">
        <div className="price">
          <b>{formatMoney(price, currency)}</b>
          {outOfStock ? <s style={{ textDecoration: "none" }}>Rupture de stock</s> : p.stock <= 2 && <s style={{ textDecoration: "none" }}>Plus que {p.stock} en stock</s>}
        </div>
        <button
          type="button"
          className={`add ${added ? "done" : ""}`}
          disabled={outOfStock}
          onClick={() => {
            add({ productId: p.id, name: p.name, color: color.name, hex: color.hex, go: option.go, priceEur: option.price });
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
        >
          {added ? "Ajouté ✓" : "Ajouter"}
        </button>
      </div>
    </article>
  );
}

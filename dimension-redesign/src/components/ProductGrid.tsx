"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import ProductCard from "./ProductCard";
import { KIND_LABEL, type Kind, type Product } from "@/lib/catalog";

type Filter = "all" | Kind | "stock";

export default function ProductGrid({ items, limit }: { items: Product[]; limit?: number }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(!limit);

  const filters = useMemo(() => {
    const kinds = (Object.keys(KIND_LABEL) as Kind[]).filter((k) => items.some((p) => p.kind === k));
    return [
      { id: "all" as Filter, label: "Tout", n: items.length },
      { id: "stock" as Filter, label: "En stock", n: items.filter((p) => p.inStock).length },
      ...kinds.map((k) => ({ id: k as Filter, label: KIND_LABEL[k], n: items.filter((p) => p.kind === k).length })),
    ];
  }, [items]);

  const list = items.filter((p) => filter === "all" || (filter === "stock" ? p.inStock : p.kind === filter));
  const shown = showAll ? list : list.slice(0, limit);

  return (
    <LayoutGroup>
      <div className="chips" role="group" aria-label="Filtrer les pièces">
        {filters.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {filter === f.id && <motion.span layoutId="chip-bg" className="chip-bg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span>{f.label}<sup>{f.n}</sup></span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{list.length} pièces affichées</p>
      <motion.ul className="grid" layout style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard p={p} priority={i < 4} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!showAll && list.length > (limit ?? 0) && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <button className="btn btn-ghost" onClick={() => setShowAll(true)}>
            Voir les {list.length} pièces
          </button>
        </div>
      )}
    </LayoutGroup>
  );
}

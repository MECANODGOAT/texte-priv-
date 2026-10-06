"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Viewer360 from "./Viewer360";
import { Arrow } from "./Icons";
import { formatPrice, type Product } from "@/lib/catalog";

const LINES = [["Beyond"], ["the", "accent"], ["extreme"]] as const;
const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero({ product, total }: { product: Product; total: number }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden />
      <div className="hero-ghost" aria-hidden>Dimension</div>
      <div className="wrap hero-grid">
        <div>
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <span className="dot" /> Drop Zenith — Summer 2026
          </motion.span>
          <h1 id="hero-title">
            {LINES.map(([word, tone], i) => (
              <span className="line" key={word}>
                <motion.span
                  className={tone === "accent" ? "accent" : undefined}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.1 + i * 0.12, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease }}>
            Streetwear oversize pensé au Maroc. Coton premium, imprimés exclusifs et drops en
            quantités limitées. Faites tourner chaque pièce à 360° avant de la porter.
          </motion.p>
          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.62, ease }}>
            <Link href="#nouveautes" className="btn btn-red">Découvrir le drop <Arrow /></Link>
            <Link href="#drops" className="btn btn-ghost">Les collections</Link>
          </motion.div>
          <motion.dl className="hero-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}>
            <div><dt className="sr-only">Pièces</dt><dd style={{ margin: 0 }}><strong>{total}</strong><span>pièces</span></dd></div>
            <div><dt className="sr-only">Collections</dt><dd style={{ margin: 0 }}><strong>5</strong><span>drops</span></dd></div>
            <div><dt className="sr-only">Livraison</dt><dd style={{ margin: 0 }}><strong>24h</strong><span>Casablanca</span></dd></div>
          </motion.dl>
        </div>

        <motion.div
          className="hero-product"
          initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
        >
          <div className="hero-tag">
            <small>En vedette</small>
            <b>{product.name}</b>
            <Link href={`/produit/${product.slug}`}>{formatPrice(product.price)} — Voir la pièce →</Link>
          </div>
          <Viewer360 front={product.front.cutout} back={product.back?.cutout} alt={product.name} variant="hero" priority />
        </motion.div>
      </div>
    </section>
  );
}

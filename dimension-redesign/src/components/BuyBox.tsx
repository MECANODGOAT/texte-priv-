"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Arrow, Check, Close } from "./Icons";
import { collectionName, formatPrice, isOnSale, KIND_LABEL, type Product } from "@/lib/catalog";

export default function BuyBox({ p }: { p: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const guide = useRef<HTMLDialogElement>(null);
  const off = isOnSale(p) ? Math.round((1 - p.price / p.regularPrice) * 100) : 0;

  return (
    <motion.div
      className="pdp-info"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <span className="kicker">{KIND_LABEL[p.kind]} · {collectionName(p.collection)}</span>
        <h1>{p.name}</h1>
      </div>

      <div className="pdp-price">
        <span>{formatPrice(p.price)}</span>
        {off > 0 && <><s>{formatPrice(p.regularPrice)}</s><span className="off">-{off}%</span></>}
      </div>

      <span className={`stock ${p.inStock ? "" : "out"}`}>{p.inStock ? "En stock — expédié sous 24h" : "Épuisé — revient bientôt"}</span>

      {p.description && <Description text={p.description} />}

      <fieldset className="sizes" disabled={!p.inStock}>
        <legend>
          <span>Taille {size && `: ${size}`}</span>
          {p.sizeChart && <button type="button" onClick={() => guide.current?.showModal()}>Guide des tailles</button>}
        </legend>
        <div className="size-row">
          {p.sizes.map((s) => (
            <label key={s}>
              <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pdp-buy">
        {/* Maquette : la commande se finalise sur la boutique WooCommerce actuelle. */}
        <a className={`btn ${p.inStock ? "btn-red" : "btn-ghost"}`} href={p.permalink}>
          {p.inStock ? (size ? `Commander en ${size}` : "Commander") : "Être prévenu du retour"} <Arrow />
        </a>
        <p className="pdp-note">Coupe oversize : prenez votre taille habituelle.</p>
      </div>

      <ul className="perks">
        <li><Check /> Livraison offerte dès 500 DH</li>
        <li><Check /> 24h à Casablanca, 48 à 72h partout au Maroc</li>
        <li><Check /> Service client du lundi au vendredi, 10h–18h</li>
      </ul>

      {p.sizeChart && (
        <dialog ref={guide} className="sheet" aria-label="Guide des tailles" onClick={(e) => e.target === e.currentTarget && guide.current?.close()}>
          <button className="icon-btn sheet-close" aria-label="Fermer le guide des tailles" onClick={() => guide.current?.close()}><Close /></button>
          <Image src={p.sizeChart} alt={`Guide des tailles — ${KIND_LABEL[p.kind]}`} width={700} height={875} />
        </dialog>
      )}
    </motion.div>
  );
}

// Affiche les deux premières phrases ; le reste se déplie à la demande.
function Description({ text }: { text: string }) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  const intro = sentences.slice(0, 2).join("").trim();
  const rest = text.slice(intro.length).trim();
  if (!rest) return <p className="pdp-desc">{text}</p>;
  return (
    <details className="pdp-desc">
      <summary>{intro}</summary>
      <p>{rest}</p>
    </details>
  );
}

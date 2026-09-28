"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatMoney, goLabel, toLocal } from "@/lib/catalog";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { lines, open, setOpen, currency, setQty, remove, toast } = useCart();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const total = lines.reduce((s, l) => s + toLocal(l.priceEur, currency) * l.qty, 0);

  useEffect(() => {
    if (open) closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div className={`veil ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Panier" aria-hidden={!open} inert={!open}>
        <div className="dhead">
          <h2>Panier</h2>
          <button ref={closeBtn} className="x" type="button" onClick={() => setOpen(false)} aria-label="Fermer le panier">
            ×
          </button>
        </div>
        <div className="lines">
          {lines.length === 0 && <p className="empty" style={{ padding: 0 }}>Votre panier est vide.</p>}
          {lines.map((l) => (
            <div className="line" key={l.key}>
              <i style={{ background: l.hex }} />
              <div>
                <b>{l.name}</b>
                <small>
                  {l.color} · {goLabel(l.go)}
                </small>
                <div className="qty">
                  <button type="button" aria-label="Retirer un exemplaire" onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                  <span className="mono">{l.qty}</span>
                  <button type="button" aria-label="Ajouter un exemplaire" onClick={() => setQty(l.key, l.qty + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <b className="mono">{formatMoney(toLocal(l.priceEur, currency) * l.qty, currency)}</b>
                <br />
                <button className="rm" type="button" onClick={() => remove(l.key)}>Retirer</button>
              </div>
            </div>
          ))}
        </div>
        <div className="total">
          <span>Total</span>
          <span>{formatMoney(total, currency)}</span>
        </div>
        {lines.length > 0 ? (
          <Link className="btn" href="/commande" onClick={() => setOpen(false)}>
            Passer commande
          </Link>
        ) : (
          <button className="btn" type="button" disabled style={{ opacity: 0.5 }}>Passer commande</button>
        )}
        <p className="dnote">Paiement par mobile money, transfert ou virement à l&apos;étape suivante.</p>
      </aside>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </>
  );
}

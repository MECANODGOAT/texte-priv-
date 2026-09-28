"use client";

import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/lib/catalog";
import { useCart } from "./CartProvider";

export function Header() {
  const { count, country, setCountry, setOpen } = useCart();
  return (
    <nav>
      <Link className="brand" href="/">
        firniss<span>.phone</span>
      </Link>
      <div className="nlinks">
        <Link href="/#catalogue">Catalogue</Link>
        <Link href="/#avantages">Garanties</Link>
        <Link href="/#paiement">Paiement</Link>
      </div>
      <div className="nav-right">
        <div className="country-switch" role="group" aria-label="Pays de livraison">
          {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
            <button key={c} type="button" aria-pressed={country === c} onClick={() => setCountry(c)}>
              {COUNTRIES[c].name}
            </button>
          ))}
        </div>
        <button className="cart-btn" type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${count} article(s)`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 7h12l-1 13H7L6 7Z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          <span className="lbl">Panier</span> <b>{count}</b>
        </button>
      </div>
    </nav>
  );
}

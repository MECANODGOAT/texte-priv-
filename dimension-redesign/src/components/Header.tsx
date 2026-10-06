"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bag, Close, Heart, Menu, Search } from "./Icons";

const LINKS = [
  { href: "/#nouveautes", label: "Nouveautés" },
  { href: "/#drops", label: "Collections" },
  { href: "/#lookbook", label: "Lookbook" },
  { href: "/#contact", label: "Contact" },
];

export const LOGO = "https://dimensionbte.com/wp-content/uploads/2025/12/dimension-logo-430x113.png";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // L'en-tête se cache en descendant et réapparaît dès qu'on remonte.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 240 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`header ${hidden && !open ? "is-hidden" : ""}`}>
        <div className="wrap header-row">
          <button className="icon-btn menu-btn" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <nav aria-label="Navigation principale">
            <ul>
              {LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </nav>
          <Link href="/" className="logo" aria-label="Dimension — accueil">
            <Image src={LOGO} alt="Dimension" width={430} height={113} priority />
          </Link>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Rechercher"><Search /></button>
            <button className="icon-btn" aria-label="Favoris"><Heart /></button>
            <button className="icon-btn" aria-label="Panier, 0 article"><Bag /><span className="count" aria-hidden>0</span></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="icon-btn close" aria-label="Fermer le menu" onClick={() => setOpen(false)} autoFocus>
              <Close />
            </button>
            {LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}>
                <Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

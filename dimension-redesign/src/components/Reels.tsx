"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AutoVideo from "./AutoVideo";
import Reveal from "./Reveal";
import { Close } from "./Icons";
import type { Reel } from "@/lib/catalog";

const Sound = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m22 9-6 6M16 9l6 6" />}
  </svg>
);
const Expand = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

// Reels verticaux façon stories : lecture muette quand visibles, un seul
// reel avec le son à la fois, agrandissement en plein écran avec contrôles.
export default function Reels({ items, names }: { items: Reel[]; names: Record<string, string> }) {
  const [sound, setSound] = useState<number | null>(null);
  const [open, setOpen] = useState<Reel | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const show = (r: Reel) => {
    setSound(null);
    setOpen(r);
    dialog.current?.showModal();
  };

  return (
    <section id="reels" className="section" aria-labelledby="reels-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="kicker">Dans la Dimension</span>
            <h2 id="reels-title">Reels</h2>
          </div>
          <p>Les drops en mouvement : shootings, coulisses et teasers. Touchez le son pour écouter.</p>
        </Reveal>
      </div>
      <ul className="reels">
        {items.map((r, i) => (
          <Reveal as="li" key={r.id} delay={Math.min(i, 5) * 0.06} className="reel">
            <AutoVideo src={r.src} poster={r.poster} className="reel-video" muted={sound !== r.id} label={`Reel ${r.title}`} />
            <div className="reel-top">
              <button type="button" className="reel-btn" aria-pressed={sound === r.id}
                aria-label={sound === r.id ? `Couper le son de ${r.title}` : `Activer le son de ${r.title}`}
                onClick={() => setSound(sound === r.id ? null : r.id)}>
                <Sound on={sound === r.id} />
              </button>
              <button type="button" className="reel-btn" aria-label={`Agrandir ${r.title}`} onClick={() => show(r)}>
                <Expand />
              </button>
            </div>
            <div className="reel-info">
              <strong>{r.title}</strong>
              <Link href={r.product ? `/produit/${r.product}` : `/collection/${r.collection}`}>
                {r.product ? "Voir la pièce" : names[r.collection]} →
              </Link>
            </div>
          </Reveal>
        ))}
      </ul>

      <dialog ref={dialog} className="reel-dialog" aria-label={open ? `Reel ${open.title}` : "Reel"}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
        {open && <video key={open.id} src={open.src} poster={open.poster} controls autoPlay playsInline loop />}
        <button className="icon-btn sheet-close" aria-label="Fermer la vidéo" onClick={() => dialog.current?.close()}><Close /></button>
      </dialog>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

type Props = {
  front: string;
  back?: string | null;
  alt: string;
  /** "hero" : grand format sans contrôles détaillés ; "page" : fiche produit. */
  variant?: "hero" | "page";
  autoplay?: boolean;
  priority?: boolean;
};

// Couches intermédiaires empilées en profondeur : vues de profil, elles
// dessinent la tranche du vêtement au lieu d'une carte plate.
const LAYERS = 7;
const DEPTH = 18; // px entre la face et le dos
const SPEED = 36; // degrés par seconde en rotation automatique
const TILT = 32; // amplitude max sans vue de dos

const norm = (a: number) => ((a % 360) + 360) % 360;
const spring = { type: "spring", stiffness: 90, damping: 18 } as const;

export default function Viewer360({ front, back, alt, variant = "page", autoplay = true, priority }: Props) {
  const reduce = useReducedMotion();
  const full = Boolean(back);
  const angle = useMotionValue(0);
  const [playing, setPlaying] = useState(autoplay);
  const [touched, setTouched] = useState(false);
  const [side, setSide] = useState<"face" | "dos">("face");
  const drag = useRef<{ x: number; t: number; v: number } | null>(null);

  // Rotation automatique : tour complet avec vue de dos, balancement sinon.
  useEffect(() => {
    if (!playing || reduce) return;
    let raf = 0;
    let prev = performance.now();
    const start = prev;
    const tick = (t: number) => {
      const dt = (t - prev) / 1000;
      prev = t;
      if (!drag.current) {
        angle.set(full ? angle.get() + SPEED * dt : Math.sin((t - start) / 1500) * TILT);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduce, full, angle]);

  useMotionValueEvent(angle, "change", (a) => {
    const s = norm(a) > 90 && norm(a) < 270 ? "dos" : "face";
    if (s !== side) setSide(s);
  });

  const stop = () => {
    setPlaying(false);
    setTouched(true);
  };

  const clamp = (a: number) => (full ? a : Math.max(-TILT, Math.min(TILT, a)));

  // Va à l'angle `target` (0 = face, 180 = dos) par le chemin le plus court.
  const snapTo = (target: number) => {
    stop();
    const a = angle.get();
    animate(angle, a + (((target - norm(a) + 540) % 360) - 180), spring);
  };

  const rotateBy = (delta: number) => {
    stop();
    animate(angle, clamp(angle.get() + delta), spring);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    stop();
    angle.stop();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    d.v = (dx / Math.max(1, now - d.t)) * 1000 * 0.5; // degrés / s
    d.x = e.clientX;
    d.t = now;
    angle.set(clamp(angle.get() + dx * 0.5));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (full) {
      // Inertie : le vêtement continue sur sa lancée puis ralentit.
      animate(angle, angle.get() + d.v * 0.35, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    } else {
      animate(angle, 0, spring);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); rotateBy(-30); }
    if (e.key === "ArrowRight") { e.preventDefault(); rotateBy(30); }
  };

  // Éclairage : la face s'assombrit en tournant, l'ombre au sol se resserre.
  const cos = useTransform(angle, (a) => Math.abs(Math.cos((a * Math.PI) / 180)));
  const faceLight = useTransform(cos, (c) => `brightness(${0.62 + 0.38 * c})`);
  const shadowScale = useTransform(cos, (c) => 0.55 + 0.45 * c);
  const sheen = useTransform(angle, (a) => `${50 + Math.sin((a * Math.PI) / 180) * 60}%`);
  const degrees = useTransform(angle, (a) => `${Math.round(norm(a))}°`);

  const sizes = variant === "hero" ? "(max-width: 900px) 80vw, 40vw" : "(max-width: 900px) 90vw, 45vw";

  return (
    <div className={`v360 v360--${variant}`}>
      <div
        className="v360-stage"
        role="group"
        aria-roledescription="visionneuse 360°"
        aria-label={`${alt} — vue ${side}. Glissez ou utilisez les flèches gauche et droite pour tourner.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div className="v360-shadow" style={{ scaleX: shadowScale }} aria-hidden />
        <motion.div className="v360-object" style={{ rotateY: angle }}>
          <motion.div className="v360-layer v360-face" style={{ transform: `translateZ(${DEPTH / 2}px)`, filter: faceLight, ["--mask" as string]: `url(${front})` }}>
            <Image src={front} alt="" fill sizes={sizes} priority={priority} draggable={false} />
            <motion.span className="v360-sheen" style={{ left: sheen }} aria-hidden />
          </motion.div>
          {full &&
            Array.from({ length: LAYERS }, (_, i) => (
              <div
                key={i}
                className="v360-layer v360-slice"
                style={{ transform: `translateZ(${DEPTH / 2 - ((i + 1) * DEPTH) / (LAYERS + 1)}px)` }}
                aria-hidden
              >
                <Image src={front} alt="" fill sizes={sizes} draggable={false} />
              </div>
            ))}
          {back && (
            <motion.div className="v360-layer v360-back" style={{ transform: `rotateY(180deg) translateZ(${DEPTH / 2}px)`, filter: faceLight }}>
              <Image src={back} alt="" fill sizes={sizes} draggable={false} />
            </motion.div>
          )}
        </motion.div>
        <span className={`v360-hint ${touched ? "is-hidden" : ""}`} aria-hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
          Glissez pour tourner
        </span>
      </div>

      <div className="v360-controls">
        {full ? (
          <>
            <span className="v360-badge">360°</span>
            <div className="v360-seg" role="group" aria-label="Choisir la vue">
              <button type="button" aria-pressed={side === "face"} onClick={() => snapTo(0)}>Face</button>
              <button type="button" aria-pressed={side === "dos"} onClick={() => snapTo(180)}>Dos</button>
            </div>
            <motion.span className="v360-deg" aria-hidden>{degrees}</motion.span>
          </>
        ) : (
          <span className="v360-badge v360-badge--muted">3D</span>
        )}
        {!reduce && (
          <button
            type="button"
            className="v360-play"
            onClick={() => { setPlaying((p) => !p); setTouched(true); }}
            aria-label={playing ? "Mettre la rotation en pause" : "Lancer la rotation automatique"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

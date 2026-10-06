"use client";

// Adapté de « Coverflow Carousel » (21st.dev, @educalvolpz) : CSS du projet au
// lieu de Tailwind, next/image, légendes avec lien, clic sur les vignettes
// latérales et espacement calculé d'après la largeur disponible.
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type PanInfo } from "motion/react";

export type CoverflowItem = {
  id: string;
  image: string;
  alt: string;
  caption?: string;
  href?: string;
};

type Props = {
  items: CoverflowItem[];
  label: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  /** Rotation des vignettes latérales, en degrés. */
  rotation?: number;
  depth?: number;
  scaleStep?: number;
  className?: string;
};

const SWIPE_VELOCITY = 500;
const SWIPE_DISTANCE = 60;
const MAX_VISIBLE = 3;
const MIN_SCALE = 0.4;

export default function CoverflowCarousel({
  items, label, autoplay = false, autoplayDelay = 4000, loop = true,
  rotation = 45, depth = 180, scaleStep = 0.12, className,
}: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [spacing, setSpacing] = useState(220);
  const root = useRef<HTMLDivElement>(null);
  // Le défilement automatique ne tourne que lorsque le carrousel est à l'écran.
  const inView = useInView(root, { amount: 0.4 });
  const total = items.length;

  const goTo = useCallback((next: number) => {
    setActive(loop ? ((next % total) + total) % total : Math.min(Math.max(next, 0), total - 1));
  }, [loop, total]);

  // Espacement proportionnel à la largeur d'une vignette (mesurée en CSS).
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const card = el.querySelector<HTMLElement>(".cf-card");
      if (card) setSpacing(card.offsetWidth * 0.62);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || reduce || paused || !inView || total <= 1) return;
    const t = setInterval(() => goTo(active + 1), autoplayDelay);
    return () => clearInterval(t);
  }, [autoplay, reduce, paused, inView, active, autoplayDelay, goTo, total]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) goTo(active + 1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) goTo(active - 1);
  };

  // Décalage le plus court entre une vignette et la vignette active (boucle).
  const offsetOf = (i: number) => {
    let o = i - active;
    if (loop) {
      if (o > total / 2) o -= total;
      if (o < -total / 2) o += total;
    }
    return o;
  };

  const current = items[active];

  return (
    <div
      ref={root}
      className={`cf ${className ?? ""}`}
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div
        className="cf-track"
        drag={total > 1 && !reduce ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        style={{ perspective: reduce ? undefined : 1200 }}
      >
        {items.map((item, i) => {
          const offset = offsetOf(i);
          if (Math.abs(offset) > MAX_VISIBLE) return null;
          const isActive = offset === 0;
          return (
            <motion.div
              key={item.id}
              className={`cf-card ${isActive ? "is-active" : ""}`}
              aria-hidden={!isActive}
              initial={false}
              animate={reduce
                ? { opacity: isActive ? 1 : 0, x: offset * spacing }
                : {
                    opacity: 1 - Math.abs(offset) * 0.18,
                    rotateY: -offset * rotation,
                    scale: Math.max(1 - Math.abs(offset) * scaleStep, MIN_SCALE),
                    x: offset * spacing,
                    z: -Math.abs(offset) * depth,
                  }}
              transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0.12, duration: 0.55 }}
              style={{ zIndex: total - Math.abs(offset) }}
              onClick={isActive ? undefined : () => goTo(i)}
            >
              <Image src={item.image} alt={isActive ? item.alt : ""} fill sizes="(max-width: 700px) 70vw, 380px" draggable={false} />
              <span className="cf-glare" aria-hidden />
            </motion.div>
          );
        })}
      </motion.div>

      <div className="cf-bar">
        <button type="button" className="cf-nav" aria-label="Photo précédente" onClick={() => goTo(active - 1)} disabled={!loop && active === 0}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="cf-caption" aria-live="polite">
          <span className="cf-count">{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          {current?.caption && (current.href
            ? <Link href={current.href}>{current.caption} →</Link>
            : <span>{current.caption}</span>)}
        </div>
        <button type="button" className="cf-nav" aria-label="Photo suivante" onClick={() => goTo(active + 1)} disabled={!loop && active === total - 1}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}

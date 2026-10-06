"use client";

// Adapté de « Page Transition » (21st.dev, @su2491251), effet « double-stairs » :
// colonnes alternées qui recouvrent l'écran, navigation pendant que l'écran est
// couvert, puis révélation de la nouvelle page. Le composant d'origine ne jouait
// jamais sa sortie (il se démontait dès isVisible=false) : les phases sont ici
// explicites. Les clics sur les liens internes sont interceptés automatiquement.
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { LOGO } from "./Header";

const COLUMNS = 5;
const ease = [0.76, 0, 0.24, 1] as const;

const columns: Variants = {
  initial: (i: number) => ({ y: i % 2 === 0 ? "-100%" : "100%" }),
  cover: (i: number) => ({ y: "0%", transition: { duration: 0.6, ease, delay: i * 0.05 } }),
  reveal: (i: number) => ({ y: i % 2 === 0 ? "100%" : "-100%", transition: { duration: 0.6, ease, delay: i * 0.05 } }),
};

type Phase = "idle" | "cover" | "reveal";

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const target = useRef<string | null>(null);

  // Intercepte (en phase de capture, avant les <Link> de Next) les clics sur
  // les liens internes qui changent de page.
  useEffect(() => {
    if (reduce) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      target.current = url.pathname + url.search + url.hash;
      setPhase("cover");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduce]);

  // La nouvelle page est affichée : on lève le rideau.
  useEffect(() => {
    if (phase === "cover" && target.current === null) setPhase("reveal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Filet de sécurité si la navigation n'aboutit pas.
  useEffect(() => {
    if (phase !== "cover") return;
    const t = setTimeout(() => setPhase("reveal"), 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const onDone = () => {
    if (phase === "cover" && target.current) {
      const href = target.current;
      target.current = null;
      router.push(href);
    } else if (phase === "reveal") {
      setPhase("idle");
    }
  };

  if (phase === "idle") return null;

  return (
    <motion.div className="pt" initial="initial" animate={phase} aria-hidden>
      {Array.from({ length: COLUMNS }, (_, i) => (
        <motion.div
          key={i}
          className={`pt-col ${i === 2 ? "pt-col--red" : ""}`}
          variants={columns}
          custom={i}
          // La dernière colonne termine en dernier (délai le plus long).
          onAnimationComplete={i === COLUMNS - 1 ? onDone : undefined}
        />
      ))}
      <motion.div
        className="pt-logo"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase === "cover" ? { opacity: 1, scale: 1, transition: { delay: 0.35, duration: 0.3 } } : { opacity: 0, transition: { duration: 0.15 } }}
      >
        <Image src={LOGO} alt="" width={430} height={113} priority />
      </motion.div>
    </motion.div>
  );
}

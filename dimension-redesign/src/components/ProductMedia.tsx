"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AutoVideo from "./AutoVideo";
import Viewer360 from "./Viewer360";
import type { Product } from "@/lib/catalog";

type Video = { src: string; poster: string; vertical: boolean };

// Fiche produit : visionneuse 360° et, quand elle existe, la vidéo du produit.
export default function ProductMedia({ p, video }: { p: Product; video: Video | null }) {
  const [tab, setTab] = useState<"360" | "video">("360");
  if (!video) return <Viewer360 front={p.front.cutout} back={p.back?.cutout} alt={p.name} priority />;

  return (
    <div className="pm">
      <div className="pm-tabs v360-seg" role="tablist" aria-label="Mode d’affichage">
        <button role="tab" type="button" aria-selected={tab === "360"} onClick={() => setTab("360")}>360°</button>
        <button role="tab" type="button" aria-selected={tab === "video"} onClick={() => setTab("video")}>
          <span className="pm-dot" aria-hidden /> Vidéo
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "360" ? (
            <Viewer360 front={p.front.cutout} back={p.back?.cutout} alt={p.name} priority />
          ) : (
            <div className={`pm-video ${video.vertical ? "is-vertical" : ""}`}>
              <AutoVideo src={video.src} poster={video.poster} label={`Vidéo de ${p.name}`} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

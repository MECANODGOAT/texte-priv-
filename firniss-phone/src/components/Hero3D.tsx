"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { Phone3D } from "./Phone3D";

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

// Téléphone vedette : tourne tout seul, se fait pivoter au doigt ou à la souris.
export function Hero3D({ product }: { product: Product }) {
  const [colorIdx, setColorIdx] = useState(0);
  const phone = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const color = product.colors[colorIdx] ?? product.colors[0];

  useEffect(() => {
    const el = phone.current, sc = scene.current;
    if (!el || !sc) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ry = 150, rx = 6, vel = 0.25, dragging = false, lastX = 0, lastY = 0, raf = 0;
    const apply = () => {
      el.style.setProperty("--ry", `${ry}deg`);
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--sheen", `${((((ry % 360) + 360) % 360) / 360) * 120 - 60}%`);
    };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; sc.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      ry += dx * 0.6;
      rx = Math.max(-25, Math.min(25, rx - dy * 0.3));
      vel = dx * 0.15; lastX = e.clientX; lastY = e.clientY;
      apply();
    };
    const up = () => { dragging = false; };
    const loop = () => {
      if (!dragging) {
        vel = reduce ? vel * 0.9 : vel + (0.25 - vel) * 0.03;
        ry += vel; rx += (6 - rx) * 0.04;
        apply();
      }
      raf = requestAnimationFrame(loop);
    };
    sc.addEventListener("pointerdown", down);
    sc.addEventListener("pointermove", move);
    sc.addEventListener("pointerup", up);
    sc.addEventListener("pointercancel", up);
    apply();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      sc.removeEventListener("pointerdown", down);
      sc.removeEventListener("pointermove", move);
      sc.removeEventListener("pointerup", up);
      sc.removeEventListener("pointercancel", up);
    };
  }, []);

  const glow = hexA(color.hex === "#cfd2d6" ? "#e0a36a" : color.hex, 0.55);

  return (
    <div className="stage" style={{ "--hero-glow": glow } as React.CSSProperties}>
      <div className="scene" ref={scene} aria-label={`Aperçu 3D de l'${product.name}. Faites-le glisser pour le tourner.`}>
        <Phone3D phoneRef={phone} className="live" color={color.hex} camera={product.camera} hasIsland={product.hasIsland} />
      </div>
      <div className="stage-info">
        <div className="nm">{product.name}</div>
        <div className="swatches">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="sw"
              style={{ backgroundColor: c.hex }}
              aria-label={c.name}
              title={c.name}
              aria-pressed={i === colorIdx}
              onClick={() => setColorIdx(i)}
            />
          ))}
        </div>
        <div className="hint">Glissez pour faire tourner le téléphone</div>
      </div>
    </div>
  );
}

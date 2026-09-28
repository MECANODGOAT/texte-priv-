import type { CSSProperties } from "react";
import type { Camera } from "@/lib/catalog";

type Props = {
  color: string;
  camera: Camera;
  hasIsland: boolean;
  style?: CSSProperties;
  phoneRef?: React.Ref<HTMLDivElement>;
  className?: string;
};

// Téléphone dessiné en CSS 3D : dos coloré avec son bloc photo, écran, et 4 tranches.
export function Phone3D({ color, camera, hasIsland, style, phoneRef, className }: Props) {
  const lenses = camera === "duo" || camera === "diag" ? 2 : 3;
  const camClass = camera === "diag" ? "duo diag" : camera;
  return (
    <div
      ref={phoneRef}
      className={`phone ${className ?? ""}`}
      style={{ "--c": color, ...style } as CSSProperties}
      aria-hidden="true"
    >
      <div className="back">
        <div className={`cam ${camClass}`}>
          {Array.from({ length: lenses }, (_, i) => (
            <span key={i} className="lens" />
          ))}
        </div>
        <span className="logo-mark">firniss</span>
      </div>
      <div className="front">
        <div className="scr" />
        <div className={hasIsland ? "isl" : "notch"} />
        <div className="date">firniss.phone</div>
        <div className="time">9:41</div>
      </div>
      <div className="edge l" />
      <div className="edge r" />
      <div className="edge t" />
      <div className="edge b" />
    </div>
  );
}

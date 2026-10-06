// Icônes SVG au trait (style Lucide), décoratives par défaut.
type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const Arrow = ({ size = 18 }: P) => <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const ArrowUpRight = ({ size = 18 }: P) => <svg {...base(size)}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const Search = ({ size = 20 }: P) => <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const Bag = ({ size = 20 }: P) => <svg {...base(size)}><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>;
export const Heart = ({ size = 20 }: P) => <svg {...base(size)}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>;
export const Menu = ({ size = 22 }: P) => <svg {...base(size)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
export const Close = ({ size = 22 }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Truck = ({ size = 24 }: P) => <svg {...base(size)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
export const Headset = ({ size = 24 }: P) => <svg {...base(size)}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>;
export const Sparkle = ({ size = 24 }: P) => <svg {...base(size)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>;
export const Check = ({ size = 18 }: P) => <svg {...base(size)}><path d="m5 12 4.5 4.5L19 7" /></svg>;

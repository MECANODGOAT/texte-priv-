// Badges provisoires aux couleurs des opérateurs.
// Pour les remplacer par les logos officiels : déposez les fichiers dans public/paiements/
// (ex. public/paiements/wave.svg) et renseignez le chemin dans LOGO_FILES ci-dessous.

const LOGO_FILES: Record<string, string | undefined> = {
  // wave: "/paiements/wave.svg",
};

const BADGES: Record<string, { bg: string; fg: string; label: React.ReactNode }> = {
  wafacash: { bg: "#ffd200", fg: "#1a1a1a", label: "wafacash" },
  "banque-populaire": { bg: "#6b3a1f", fg: "#f7a21b", label: "BP" },
  cih: { bg: "#0a3d8f", fg: "#fff", label: <>CIH<span style={{ color: "#f28c00" }}>&nbsp;BANK</span></> },
  "airtel-money": { bg: "#e40000", fg: "#fff", label: <>airtel<span style={{ fontWeight: 500 }}>&nbsp;money</span></> },
  "moov-money": { bg: "#0055a5", fg: "#fff", label: <>moov<span style={{ color: "#f7941d" }}>&nbsp;money</span></> },
  wave: { bg: "#1dc4ff", fg: "#0b2b4a", label: "wave" },
};

export function PaymentLogo({ code, name }: { code: string; name: string }) {
  const file = LOGO_FILES[code];
  const badge = BADGES[code] ?? { bg: "#3a2a20", fg: "#f6ece1", label: name };
  return (
    <span className="lg" style={{ background: file ? "#fff" : badge.bg, color: badge.fg }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- petit logo statique */}
      {file ? <img src={file} alt={name} /> : badge.label}
    </span>
  );
}

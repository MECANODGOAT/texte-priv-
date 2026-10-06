import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section" style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "clamp(64px, 12vw, 160px)" }}>404</h1>
      <p style={{ color: "var(--muted)", margin: "16px 0 32px" }}>Cette pièce a quitté la dimension.</p>
      <Link href="/" className="btn btn-red">Retour à l’accueil</Link>
    </div>
  );
}

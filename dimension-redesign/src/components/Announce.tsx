// Bandeau défilant : messages alignés sur la politique de livraison réelle
// (l'ancien bandeau promettait « 24h partout au Maroc »).
const MESSAGES = [
  "Livraison gratuite dès 500 DH",
  "Expédition en 24h à Casablanca",
  "48 à 72h partout au Maroc",
  "Nouveau drop : Zenith — Summer 2026",
];

export default function Announce() {
  const row = MESSAGES.map((m) => <span key={m}>{m}</span>);
  return (
    <div className="announce">
      <p className="sr-only">{MESSAGES.join(" · ")}</p>
      <div className="marquee" aria-hidden>
        <div>{row}{row}</div>
        <div>{row}{row}</div>
      </div>
    </div>
  );
}

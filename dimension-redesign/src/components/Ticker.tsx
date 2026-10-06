const WORDS = ["Beyond the extreme", "Oversize", "Streetwear marocain", "Coton premium", "Drops limités"];

export default function Ticker() {
  const row = WORDS.map((w) => <span key={w}>{w}</span>);
  return (
    <div className="ticker" aria-hidden>
      <div className="marquee"><div>{row}</div><div>{row}</div></div>
    </div>
  );
}

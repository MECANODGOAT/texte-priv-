import { COUNTRIES, type CountryCode } from "@/lib/catalog";
import { getPaymentMethods, getProducts } from "@/lib/data";
import { Catalog } from "@/components/Catalog";
import { Hero3D } from "@/components/Hero3D";
import { PaymentLogo } from "@/components/PaymentLogos";

// Le catalogue est relu depuis la base au plus toutes les 60 secondes.
export const revalidate = 60;

const FLAGS: Record<CountryCode, React.ReactNode> = {
  MA: (
    <svg className="flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#c1272d" />
      <path d="M15 5.2l1.1 3.4h3.6l-2.9 2.1 1.1 3.4-2.9-2.1-2.9 2.1 1.1-3.4-2.9-2.1h3.6z" fill="none" stroke="#006233" strokeWidth=".9" />
    </svg>
  ),
  GA: (
    <svg className="flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#3a75c4" />
      <rect width="30" height="13.34" fill="#fcd116" />
      <rect width="30" height="6.67" fill="#009e60" />
    </svg>
  ),
};

export default async function Home() {
  const [products, methods] = await Promise.all([getProducts(), getPaymentMethods()]);
  const featured = products[0];

  return (
    <>
      <header className="hero" id="top">
        <div>
          <span className="pill">
            <i /> En stock · livraison au Maroc et au Gabon
          </span>
          <h1>
            Votre <span>iPhone</span> à petit prix.
          </h1>
          <p>Neufs et reconditionnés grade A, testés sur 40 points, garantis 12 mois. Choisissez votre modèle, votre couleur et votre capacité.</p>
          <div className="cta">
            <a className="btn" href="#catalogue">
              Voir le catalogue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>
            <a className="btn glass" href="#avantages">Nos garanties</a>
          </div>
          <div className="kpis">
            <div><b>11 → 18</b><span>toutes les générations</span></div>
            <div><b>12 mois</b><span>de garantie</span></div>
            <div><b>≥ 85 %</b><span>batterie minimum</span></div>
          </div>
        </div>
        {featured && <Hero3D product={featured} />}
      </header>

      <section id="avantages" style={{ paddingTop: 20 }}>
        <div className="perks">
          <Perk title="Garantie 12 mois" text="Neuf comme reconditionné" icon={<><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>} />
          <Perk title="Batterie ≥ 85 %" text="Capacité contrôlée" icon={<><rect x="3" y="7" width="16" height="10" rx="2" /><path d="M21 10v4M7 10v4M10 10v4" /></>} />
          <Perk title="Livraison rapide" text="Maroc et Gabon" icon={<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>} />
          <Perk title="Mobile money" text="Airtel, Moov, Wave, Wafacash…" icon={<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>} />
        </div>
      </section>

      <Catalog products={products} />

      <section id="paiement">
        <div className="shead">
          <div>
            <h2>Payez comme vous voulez</h2>
            <p>Mobile money, transfert d&apos;argent ou virement bancaire : vous choisissez au moment de la commande, et nous confirmons dès réception.</p>
          </div>
        </div>
        <div className="pay">
          {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
            <div className="country" key={c}>
              <h3>
                {FLAGS[c]}
                {COUNTRIES[c].name}
              </h3>
              <div className="methods">
                {methods
                  .filter((m) => m.country === c)
                  .map((m) => (
                    <div className="m" key={m.code}>
                      <PaymentLogo code={m.code} name={m.name} />
                      {m.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Perk({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="perk">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">{icon}</svg>
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  );
}

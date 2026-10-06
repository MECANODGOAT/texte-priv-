import Reveal from "./Reveal";
import { Headset, Sparkle, Truck } from "./Icons";

// Réassurance : textes courts, informations identiques à celles du site actuel.
export default function Bento() {
  return (
    <section id="contact" className="section" aria-labelledby="why-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="kicker">Pourquoi Dimension</span>
            <h2 id="why-title">Sans compromis</h2>
          </div>
        </Reveal>
        <div className="bento">
          <Reveal className="tile tile-red">
            <span className="ico"><Truck /></span>
            <h3>Livraison offerte</h3>
            <p>Gratuite dès 500 DH d’achat, 7 jours sur 7. Expédiée sous 24h à Casablanca, 48 à 72h partout au Maroc, avec suivi étape par étape.</p>
            <span className="big">500 DH</span>
          </Reveal>
          <Reveal className="tile" delay={0.08}>
            <span className="ico"><Headset /></span>
            <h3>Service client</h3>
            <p>Du lundi au vendredi, de 10h à 18h.</p>
            <p>
              <a className="link" href="tel:+212688640423">+212 688 640 423</a><br />
              <a className="link" href="mailto:contact@dimensionbte.com">contact@dimensionbte.com</a>
            </p>
          </Reveal>
          <Reveal className="tile" delay={0.16}>
            <span className="ico"><Sparkle /></span>
            <h3>Qualité</h3>
            <p>Coton premium et matières recyclées, pièces conçues dans des ateliers responsables. Pensées pour durer.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

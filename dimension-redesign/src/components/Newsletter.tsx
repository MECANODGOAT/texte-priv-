"use client";

import { useState } from "react";
import { Arrow } from "./Icons";

// Maquette : le formulaire n'est relié à aucun service d'e-mailing.
export default function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="wrap" aria-labelledby="nl-title">
      <div className="newsletter">
        <div>
          <span className="kicker">Accès anticipé</span>
          <h2 id="nl-title">Rejoins la Dimension</h2>
          <p>Les drops partent vite. Inscris-toi pour être prévenu avant tout le monde et recevoir les offres exclusives.</p>
        </div>
        <form className="nl-form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <label htmlFor="nl-email">Ton e-mail</label>
          <div className="nl-row">
            <input id="nl-email" type="email" name="email" required autoComplete="email" placeholder="nom@exemple.com" />
            <button className="btn btn-red" type="submit">S’inscrire <Arrow /></button>
          </div>
          <small aria-live="polite">{done ? <span className="nl-ok">Merci ! Tu seras prévenu du prochain drop.</span> : "Pas de spam. Désinscription en un clic."}</small>
        </form>
      </div>
    </section>
  );
}

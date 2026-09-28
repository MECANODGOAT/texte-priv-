"use client";

import Link from "next/link";
import { useActionState } from "react";
import { COUNTRIES, formatMoney, goLabel, toLocal, type CountryCode, type PaymentMethod } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { PaymentLogo } from "@/components/PaymentLogos";
import { placeOrder, type CheckoutState } from "./actions";

const PHONE_HINT: Record<CountryCode, string> = { MA: "+212 6 12 34 56 78", GA: "+241 07 12 34 56" };

export function CheckoutForm({ methods }: { methods: PaymentMethod[] }) {
  const { lines, country, setCountry, currency } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const available = methods.filter((m) => m.country === country);
  const total = lines.reduce((s, l) => s + toLocal(l.priceEur, currency) * l.qty, 0);

  if (lines.length === 0) {
    return (
      <div className="panel stack">
        <p style={{ margin: 0 }}>Votre panier est vide.</p>
        <Link className="btn" href="/#catalogue" style={{ justifySelf: "start" }}>Voir le catalogue</Link>
      </div>
    );
  }

  const cart = JSON.stringify(lines.map((l) => ({ productId: l.productId, color: l.color, go: l.go, qty: l.qty })));
  const err = (k: keyof typeof fe) =>
    fe[k] ? <span className="ferr" id={`${k}-err`}>{fe[k]}</span> : null;

  return (
    <form action={action} className="two" noValidate>
      <input type="hidden" name="cart" value={cart} />
      <input type="hidden" name="country" value={country} />

      <div className="panel stack">
        {state.error && <p className="alert" role="alert">{state.error}</p>}

        <div className="field">
          Pays de livraison
          <div className="country-switch" role="group" aria-label="Pays de livraison" style={{ justifySelf: "start" }}>
            {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
              <button key={c} type="button" aria-pressed={country === c} onClick={() => setCountry(c)}>
                {COUNTRIES[c].name}
              </button>
            ))}
          </div>
        </div>

        <div className="row2">
          <label className="field" htmlFor="name">
            Nom complet
            <input id="name" name="name" defaultValue={v.name} autoComplete="name" required aria-invalid={!!fe.name} aria-describedby="name-err" />
            {err("name")}
          </label>
          <label className="field" htmlFor="phone">
            Téléphone (WhatsApp)
            <input id="phone" name="phone" defaultValue={v.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder={PHONE_HINT[country]} required aria-invalid={!!fe.phone} aria-describedby="phone-err" />
            {err("phone")}
          </label>
        </div>
        <label className="field" htmlFor="email">
          E-mail (facultatif)
          <input id="email" name="email" defaultValue={v.email} type="email" autoComplete="email" aria-invalid={!!fe.email} aria-describedby="email-err" />
          {err("email")}
        </label>
        <div className="row2">
          <label className="field" htmlFor="city">
            Ville
            <input id="city" name="city" defaultValue={v.city} autoComplete="address-level2" placeholder={country === "MA" ? "Casablanca" : "Libreville"} required aria-invalid={!!fe.city} aria-describedby="city-err" />
            {err("city")}
          </label>
          <label className="field" htmlFor="address">
            Adresse
            <input id="address" name="address" defaultValue={v.address} autoComplete="street-address" placeholder="Quartier, rue, repère" required aria-invalid={!!fe.address} aria-describedby="address-err" />
            {err("address")}
          </label>
        </div>
        <label className="field" htmlFor="note">
          Précisions (facultatif)
          <textarea id="note" name="note" defaultValue={v.note} placeholder="Horaires de livraison, étage…" />
        </label>

        <fieldset className="opts" aria-describedby="payment-err">
          <legend>Moyen de paiement</legend>
          {available.map((m, i) => (
            <label key={m.code} htmlFor={`pay-${m.code}`}>
              <input type="radio" id={`pay-${m.code}`} name="payment" value={m.code} defaultChecked={v.payment ? v.payment === m.code : i === 0} />
              <PaymentLogo code={m.code} name={m.name} />
              {m.name}
            </label>
          ))}
          {err("payment")}
        </fieldset>
      </div>

      <aside className="panel">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Récapitulatif</h2>
        {lines.map((l) => (
          <div className="sum-line" key={l.key}>
            <span>
              {l.qty} × {l.name}
              <small>{l.color} · {goLabel(l.go)}</small>
            </span>
            <span className="mono">{formatMoney(toLocal(l.priceEur, currency) * l.qty, currency)}</span>
          </div>
        ))}
        <div className="sum-total">
          <span>Total</span>
          <span>{formatMoney(total, currency)}</span>
        </div>
        {fe.cart && <p className="alert" role="alert" style={{ marginTop: 14 }}>{fe.cart}</p>}
        <button className="btn" type="submit" disabled={pending} style={{ width: "100%", marginTop: 18 }}>
          {pending ? "Envoi de la commande…" : "Confirmer la commande"}
        </button>
        <p className="dnote">Vous paierez après confirmation, en suivant les instructions affichées.</p>
      </aside>
    </form>
  );
}

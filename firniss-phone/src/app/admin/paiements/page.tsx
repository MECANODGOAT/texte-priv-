import type { Metadata } from "next";
import { COUNTRIES, type PaymentMethod } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin";
import { PaymentLogo } from "@/components/PaymentLogos";
import { AdminNav } from "../AdminNav";
import { updatePaymentMethod } from "../actions";

export const metadata: Metadata = { title: "Moyens de paiement · admin", robots: { index: false } };

export default async function PaymentsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("payment_methods").select("*").order("sort");
  const methods = (data ?? []) as PaymentMethod[];

  return (
    <main className="page">
      <h1>Moyens de paiement</h1>
      <AdminNav current="/admin/paiements" />
      <p className="lede">
        Ces instructions s&apos;affichent au client juste après sa commande, avec le montant et le numéro de commande.
        Remplacez les passages entre crochets par vos vrais numéros et RIB.
      </p>
      {error && <p className="alert">Lecture impossible : {error.message}</p>}
      <div className="stack">
        {methods.map((m) => (
          <form key={m.code} action={updatePaymentMethod} className="panel stack">
            <input type="hidden" name="code" value={m.code} />
            <div className="methods" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="m" style={{ padding: 0, border: 0, background: "none" }}>
                <PaymentLogo code={m.code} name={m.name} />
              </span>
              <b>{m.name}</b>
              <span style={{ color: "var(--muted)" }}>{COUNTRIES[m.country].name}</span>
            </div>
            <label className="field" htmlFor={`ins-${m.code}`}>
              Instructions de paiement
              <textarea id={`ins-${m.code}`} name="instructions" defaultValue={m.instructions} />
            </label>
            <div className="inline-form" style={{ justifyContent: "space-between" }}>
              <label className="inline-form" style={{ gap: 6 }}>
                <input type="checkbox" name="active" defaultChecked={m.active} />
                Proposé aux clients
              </label>
              <button className="small-btn" type="submit">Enregistrer</button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}

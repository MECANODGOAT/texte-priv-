import type { Metadata } from "next";
import { getPaymentMethods } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Commande · firniss.phone" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const methods = await getPaymentMethods();
  return (
    <main className="page">
      <h1>Finaliser la commande</h1>
      <p className="lede">Indiquez où vous livrer et comment vous souhaitez payer. Vous recevrez les instructions de paiement juste après.</p>
      {!isSupabaseConfigured && (
        <p className="notice" style={{ marginBottom: 20 }}>
          Mode démonstration : la base de données n&apos;est pas encore configurée, les commandes ne peuvent pas être enregistrées.
        </p>
      )}
      <CheckoutForm methods={methods} />
    </main>
  );
}

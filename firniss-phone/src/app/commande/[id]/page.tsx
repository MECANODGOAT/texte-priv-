import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatMoney, goLabel, type Currency } from "@/lib/catalog";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { ClearCart } from "./ClearCart";

export const metadata: Metadata = { title: "Commande confirmée · firniss.phone", robots: { index: false } };
export const dynamic = "force-dynamic";

type OrderView = {
  number: number;
  customer_name: string;
  total: number;
  currency: Currency;
  status: OrderStatus;
  payment_methods: { name: string; instructions: string } | null;
  order_items: { product_name: string; color: string; storage_go: number; unit_price: number; quantity: number }[];
};

export default async function OrderPage({ params }: PageProps<"/commande/[id]">) {
  const { id } = await params;
  if (!isSupabaseConfigured || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await createServiceClient()
    .from("orders")
    .select("number, customer_name, total, currency, status, payment_methods(name, instructions), order_items(product_name, color, storage_go, unit_price, quantity)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const order = data as unknown as OrderView;

  const total = formatMoney(order.total, order.currency);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const waText = encodeURIComponent(`Bonjour, voici la preuve de paiement de ma commande n°${order.number} (${total}).`);

  return (
    <main className="page">
      <ClearCart />
      <h1>Merci {order.customer_name.split(" ")[0]} !</h1>
      <p className="lede">
        Votre commande <b className="mono">n°{order.number}</b> est enregistrée. <span className={`status ${order.status}`}>{STATUS_LABELS[order.status]}</span>
      </p>
      <div className="two">
        <div className="panel stack">
          <h2 style={{ fontSize: 20 }}>Pour payer : {order.payment_methods?.name}</h2>
          <p className="instructions" style={{ margin: 0 }}>{order.payment_methods?.instructions}</p>
          <p style={{ margin: 0 }}>
            Montant à envoyer : <b className="mono">{total}</b>
            <br />
            Référence à indiquer : <b className="mono">n°{order.number}</b>
          </p>
          {wa && (
            <a className="btn wa" href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer" style={{ justifySelf: "start" }}>
              Envoyer la preuve sur WhatsApp
            </a>
          )}
          <p className="dnote" style={{ textAlign: "left" }}>
            Dès réception du paiement, nous confirmons la commande et préparons l&apos;expédition. Gardez cette page : son adresse vous permet de suivre votre commande.
          </p>
        </div>
        <aside className="panel">
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Récapitulatif</h2>
          {order.order_items.map((i, k) => (
            <div className="sum-line" key={k}>
              <span>
                {i.quantity} × {i.product_name}
                <small>{i.color} · {goLabel(i.storage_go)}</small>
              </span>
              <span className="mono">{formatMoney(i.unit_price * i.quantity, order.currency)}</span>
            </div>
          ))}
          <div className="sum-total">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

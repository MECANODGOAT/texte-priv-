import type { Metadata } from "next";
import { COUNTRIES, formatMoney, goLabel, type CountryCode, type Currency } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { AdminNav } from "./AdminNav";
import { setOrderStatus } from "./actions";

export const metadata: Metadata = { title: "Commandes · admin", robots: { index: false } };

type Row = {
  id: string;
  number: number;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string | null;
  country: CountryCode;
  city: string;
  address: string;
  note: string | null;
  total: number;
  currency: Currency;
  status: OrderStatus;
  payment_methods: { name: string } | null;
  order_items: { product_name: string; color: string; storage_go: number; quantity: number }[];
};

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const { statut } = await searchParams;
  const filter = ORDER_STATUSES.includes(statut as OrderStatus) ? (statut as OrderStatus) : null;

  let q = supabase
    .from("orders")
    .select("id, number, created_at, customer_name, phone, email, country, city, address, note, total, currency, status, payment_methods(name), order_items(product_name, color, storage_go, quantity)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter) q = q.eq("status", filter);
  const { data, error } = await q;
  const orders = (data ?? []) as unknown as Row[];

  return (
    <main className="page">
      <h1>Commandes</h1>
      <AdminNav current="/admin" />
      <div className="chips" style={{ marginBottom: 18 }}>
        <a className="chip" href="/admin" aria-current={!filter ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Toutes</a>
        {ORDER_STATUSES.map((s) => (
          <a key={s} className="chip" href={`/admin?statut=${s}`} aria-current={filter === s ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            {STATUS_LABELS[s]}
          </a>
        ))}
      </div>
      {error && <p className="alert">Lecture des commandes impossible : {error.message}</p>}
      {orders.length === 0 ? (
        <p className="notice">Aucune commande pour le moment.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono">
                    {o.number}
                    <br />
                    <small style={{ color: "var(--muted)" }}>{new Date(o.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</small>
                  </td>
                  <td>
                    <b>{o.customer_name}</b>
                    <br />
                    <span className="mono">{o.phone}</span>
                    {o.email && <><br />{o.email}</>}
                    <br />
                    {o.address}, {o.city} ({COUNTRIES[o.country].name})
                    {o.note && <><br /><i>« {o.note} »</i></>}
                  </td>
                  <td>
                    {o.order_items.map((i, k) => (
                      <div key={k}>{i.quantity} × {i.product_name} {i.color} {goLabel(i.storage_go)}</div>
                    ))}
                  </td>
                  <td className="mono">
                    {formatMoney(o.total, o.currency)}
                    <br />
                    <small style={{ color: "var(--muted)" }}>{o.payment_methods?.name}</small>
                  </td>
                  <td>
                    <span className={`status ${o.status}`}>{STATUS_LABELS[o.status]}</span>
                    <form action={setOrderStatus} className="inline-form" style={{ marginTop: 8 }}>
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} aria-label={`Statut de la commande ${o.number}`}>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <button className="small-btn" type="submit">Mettre à jour</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="dnote" style={{ textAlign: "left", marginTop: 14 }}>
        Passer une commande en « Payée » retire les téléphones du stock. L&apos;annuler ensuite les y remet.
      </p>
    </main>
  );
}

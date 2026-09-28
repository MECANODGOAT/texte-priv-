import "server-only";

type NewOrder = {
  number: number;
  customer: string;
  phone: string;
  country: string;
  payment: string;
  total: string;
  lines: string[];
};

// Prévient la boutique d'une nouvelle commande par e-mail (via Resend).
// Sans RESEND_API_KEY et ADMIN_EMAIL, la notification est simplement ignorée :
// la commande reste visible dans l'espace admin.
export async function notifyNewOrder(o: NewOrder) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) return;

  const text = [
    `Nouvelle commande n°${o.number}`,
    "",
    ...o.lines,
    "",
    `Total : ${o.total}`,
    `Paiement : ${o.payment}`,
    `Client : ${o.customer} · ${o.phone} · ${o.country}`,
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "firniss.phone <onboarding@resend.dev>",
        to,
        subject: `Commande n°${o.number} · ${o.total}`,
        text,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Une notification ratée ne doit pas bloquer la commande du client.
  }
}

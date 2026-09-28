"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { COUNTRIES, toLocal, formatMoney, goLabel, type CountryCode } from "@/lib/catalog";
import { getPaymentMethods, getProducts } from "@/lib/data";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { notifyNewOrder } from "@/lib/notify";

export type CheckoutState = {
  error?: string;
  values?: Record<string, string>; // saisie renvoyée pour ne pas vider le formulaire en cas d'erreur
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "city" | "address" | "payment" | "cart", string>>;
};

const cartSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      color: z.string().min(1),
      go: z.number().int().positive(),
      qty: z.number().int().min(1).max(10),
    }),
  )
  .min(1, "Votre panier est vide.")
  .max(20, "Votre panier contient trop d'articles.");

const formSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom complet.").max(100),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 8, "Indiquez un numéro de téléphone valide, avec l'indicatif (+212 ou +241)."),
  email: z.union([z.literal(""), z.string().trim().email("Cette adresse e-mail n'est pas valide.")]),
  country: z.enum(["MA", "GA"]),
  city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
  address: z.string().trim().min(5, "Indiquez votre adresse de livraison.").max(300),
  note: z.string().trim().max(500).optional(),
  payment: z.string().min(1, "Choisissez un moyen de paiement."),
});

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values: Record<string, string> = {};
  for (const k of ["name", "phone", "email", "city", "address", "note", "payment"]) values[k] = String(formData.get(k) ?? "");
  const result = await validateAndSave(formData);
  return { ...result, values };
}

async function validateAndSave(formData: FormData): Promise<CheckoutState> {
  let cartRaw: unknown;
  try {
    cartRaw = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { fieldErrors: { cart: "Votre panier n'a pas pu être lu. Rechargez la page." } };
  }
  const cart = cartSchema.safeParse(cartRaw);
  if (!cart.success) return { fieldErrors: { cart: cart.error.issues[0].message } };

  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: CheckoutState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<CheckoutState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }
  const f = parsed.data;
  const country = f.country as CountryCode;
  const currency = COUNTRIES[country].currency;

  if (!isSupabaseConfigured) {
    return { error: "La boutique n'est pas encore reliée à sa base de données. Suivez le guide du fichier README pour configurer Supabase." };
  }

  const methods = await getPaymentMethods(country);
  const method = methods.find((m) => m.code === f.payment);
  if (!method) return { fieldErrors: { payment: `Ce moyen de paiement n'est pas proposé pour le ${COUNTRIES[country].name}.` } };

  // Les prix sont toujours recalculés ici, jamais repris du navigateur.
  const products = await getProducts();
  const items = [];
  for (const line of cart.data) {
    const p = products.find((x) => x.id === line.productId);
    const option = p?.storage.find((s) => s.go === line.go);
    if (!p || !option || !p.colors.some((c) => c.name === line.color)) {
      return { fieldErrors: { cart: "Un article de votre panier n'est plus disponible. Retirez-le puis réessayez." } };
    }
    const qtyInCart = cart.data.filter((l) => l.productId === p.id).reduce((n, l) => n + l.qty, 0);
    if (p.stock < qtyInCart) {
      return { fieldErrors: { cart: `${p.name} : il ne reste que ${p.stock} exemplaire(s) en stock.` } };
    }
    items.push({
      product_id: p.id,
      product_name: p.name,
      color: line.color,
      storage_go: option.go,
      unit_price: toLocal(option.price, currency),
      quantity: line.qty,
    });
  }
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const db = createServiceClient();
  const { data: order, error } = await db
    .from("orders")
    .insert({
      customer_name: f.name,
      phone: f.phone,
      email: f.email || null,
      country,
      city: f.city,
      address: f.address,
      note: f.note || null,
      payment_method: method.code,
      currency,
      total,
    })
    .select("id, number")
    .single();
  if (error || !order) return { error: "Votre commande n'a pas pu être enregistrée. Réessayez dans un instant." };

  const { error: itemsError } = await db.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) {
    await db.from("orders").delete().eq("id", order.id);
    return { error: "Votre commande n'a pas pu être enregistrée. Réessayez dans un instant." };
  }

  await notifyNewOrder({
    number: order.number,
    customer: f.name,
    phone: f.phone,
    country: COUNTRIES[country].name,
    payment: method.name,
    total: formatMoney(total, currency),
    lines: items.map((i) => `${i.quantity} × ${i.product_name} ${i.color} ${goLabel(i.storage_go)}`),
  });

  redirect(`/commande/${order.id}`);
}

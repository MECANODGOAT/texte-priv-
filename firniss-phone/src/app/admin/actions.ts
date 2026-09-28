"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUSES } from "@/lib/orders";
import { createSessionClient } from "@/lib/supabase/server";
import type { Color, StorageOption } from "@/lib/catalog";

// ---------- Connexion ----------
export async function signIn(_prev: { error: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Indiquez votre e-mail et votre mot de passe." };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou mot de passe incorrect." };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Commandes ----------
export async function setOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(ORDER_STATUSES as [string, ...string[]]).parse(formData.get("status"));
  const { error } = await supabase.rpc("set_order_status", { p_order: id, p_status: status });
  if (error) throw new Error(`Mise à jour impossible : ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/");
}

// ---------- Produits ----------
export async function updateProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const { data: product, error } = await supabase.from("products").select("storage").eq("id", id).single();
  if (error || !product) throw new Error("Produit introuvable.");

  const storage = (product.storage as StorageOption[]).map((s) => {
    const v = Number(formData.get(`price_${s.go}`));
    return { go: s.go, price: Number.isFinite(v) && v > 0 ? Math.round(v) : s.price };
  });
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  const active = formData.get("active") === "on";

  const { error: upErr } = await supabase
    .from("products")
    .update({ storage, stock, active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (upErr) throw new Error(`Enregistrement impossible : ${upErr.message}`);
  revalidatePath("/admin/produits");
  revalidatePath("/");
}

const MAX_PHOTO = 4 * 1024 * 1024;
const PHOTO_TYPES = ["image/png", "image/webp", "image/jpeg"];

export async function uploadColorPhoto(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const colorIdx = z.coerce.number().int().min(0).parse(formData.get("color"));
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choisissez une photo.");
  if (file.size > MAX_PHOTO) throw new Error("La photo dépasse 4 Mo.");
  if (!PHOTO_TYPES.includes(file.type)) throw new Error("Format accepté : PNG, WebP ou JPEG.");

  const { data: product } = await supabase.from("products").select("colors").eq("id", id).single();
  const colors = (product?.colors ?? []) as Color[];
  if (!colors[colorIdx]) throw new Error("Couleur introuvable.");

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${id}/${colorIdx}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("products").upload(path, file, { contentType: file.type });
  if (upErr) throw new Error(`Envoi de la photo impossible : ${upErr.message}`);
  const { data: pub } = supabase.storage.from("products").getPublicUrl(path);

  colors[colorIdx] = { ...colors[colorIdx], image: pub.publicUrl };
  await supabase.from("products").update({ colors, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/produits");
  revalidatePath("/");
}

export async function removeColorPhoto(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const colorIdx = z.coerce.number().int().min(0).parse(formData.get("color"));
  const { data: product } = await supabase.from("products").select("colors").eq("id", id).single();
  const colors = (product?.colors ?? []) as Color[];
  if (!colors[colorIdx]) return;
  colors[colorIdx] = { ...colors[colorIdx], image: null };
  await supabase.from("products").update({ colors, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/produits");
  revalidatePath("/");
}

// ---------- Moyens de paiement ----------
export async function updatePaymentMethod(formData: FormData) {
  const { supabase } = await requireAdmin();
  const code = z.string().min(1).parse(formData.get("code"));
  const instructions = z.string().trim().max(1000).parse(formData.get("instructions") ?? "");
  const active = formData.get("active") === "on";
  const { error } = await supabase.from("payment_methods").update({ instructions, active }).eq("code", code);
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
  revalidatePath("/admin/paiements");
  revalidatePath("/");
}

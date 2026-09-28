import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient, isSupabaseConfigured } from "./supabase/server";

// Vérifie que la personne connectée est administratrice et renvoie un client Supabase lié à sa session.
// Toutes les écritures passent par ce client : les règles RLS de la base font foi.
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) redirect("/admin/login?refus=1");
  return { supabase, user: data.user };
}

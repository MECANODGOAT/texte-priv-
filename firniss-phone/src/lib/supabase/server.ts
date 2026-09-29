import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Les deux noms sont acceptés : anciens (anon / service_role) et nouveaux (publishable / secret).
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey && serviceKey);

// Client lié à la session de l'utilisateur (espace admin). Les règles RLS s'appliquent.
export async function createSessionClient() {
  if (!url || !anonKey) throw new Error("Supabase n'est pas configuré.");
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : le proxy rafraîchit déjà la session.
        }
      },
    },
  });
}

// Client serveur avec la clé de service : contourne RLS.
// À utiliser uniquement pour les opérations publiques contrôlées (lecture du catalogue, création de commande).
export function createServiceClient() {
  if (!url || !serviceKey) throw new Error("Supabase n'est pas configuré.");
  return createPlainClient(url, serviceKey, { auth: { persistSession: false } });
}

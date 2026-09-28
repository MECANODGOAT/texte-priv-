import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion admin · firniss.phone", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { refus } = await searchParams;
  return (
    <main className="page" style={{ maxWidth: 440, marginInline: "auto" }}>
      <h1>Espace admin</h1>
      <p className="lede">Connectez-vous pour gérer les commandes, les prix et le stock.</p>
      {!isSupabaseConfigured ? (
        <p className="notice">La base de données n&apos;est pas encore configurée. Suivez le guide du fichier README.</p>
      ) : (
        <>
          {refus && <p className="alert" role="alert" style={{ marginBottom: 16 }}>Ce compte n&apos;a pas les droits d&apos;administration.</p>}
          <LoginForm />
        </>
      )}
    </main>
  );
}

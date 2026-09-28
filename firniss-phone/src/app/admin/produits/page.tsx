import type { Metadata } from "next";
import { goLabel, type Color, type StorageOption } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "../AdminNav";
import { removeColorPhoto, updateProduct, uploadColorPhoto } from "../actions";

export const metadata: Metadata = { title: "Produits · admin", robots: { index: false } };

type Row = { id: string; name: string; stock: number; active: boolean; storage: StorageOption[]; colors: Color[] };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("id, name, stock, active, storage, colors").order("sort");
  const products = (data ?? []) as Row[];

  return (
    <main className="page">
      <h1>Produits &amp; stock</h1>
      <AdminNav current="/admin/produits" />
      <p className="lede">
        Les prix sont saisis en euros : le site les convertit en dirhams (MAD) et en francs CFA (FCFA) et les arrondit.
        Ajoutez une photo par couleur pour remplacer le modèle 3D (PNG sur fond transparent de préférence, 4 Mo maximum).
      </p>
      {error && <p className="alert">Lecture des produits impossible : {error.message}</p>}
      <div className="stack">
        {products.map((p) => (
          <div className="panel stack" key={p.id}>
            <form action={updateProduct} className="inline-form" style={{ gap: 12 }}>
              <input type="hidden" name="id" value={p.id} />
              <h2 style={{ fontSize: 18, flex: "1 1 200px" }}>{p.name}</h2>
              {p.storage.map((s) => (
                <label key={s.go} className="inline-form" style={{ gap: 6 }}>
                  <span className="mono" style={{ fontSize: 13 }}>{goLabel(s.go)} (€)</span>
                  <input type="number" name={`price_${s.go}`} defaultValue={s.price} min={1} step={1} />
                </label>
              ))}
              <label className="inline-form" style={{ gap: 6 }}>
                <span style={{ fontSize: 13 }}>Stock</span>
                <input type="number" name="stock" defaultValue={p.stock} min={0} step={1} />
              </label>
              <label className="inline-form" style={{ gap: 6 }}>
                <input type="checkbox" name="active" defaultChecked={p.active} />
                <span style={{ fontSize: 13 }}>En vente</span>
              </label>
              <button className="small-btn" type="submit">Enregistrer</button>
            </form>
            <div>
              {p.colors.map((c, i) => (
                <div className="color-row" key={c.name}>
                  <span className="dot" style={{ background: c.hex }} />
                  <span style={{ minWidth: 140 }}>{c.name}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu de la photo envoyée */}
                  {c.image && <img src={c.image} alt={`${p.name} ${c.name}`} />}
                  <form action={uploadColorPhoto} className="inline-form">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="color" value={i} />
                    <input type="file" name="photo" accept="image/png,image/webp,image/jpeg" required aria-label={`Photo ${p.name} ${c.name}`} />
                    <button className="small-btn" type="submit">{c.image ? "Remplacer" : "Ajouter la photo"}</button>
                  </form>
                  {c.image && (
                    <form action={removeColorPhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="color" value={i} />
                      <button className="small-btn" type="submit">Retirer</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

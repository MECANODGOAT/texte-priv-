import Link from "next/link";
import { signOut } from "./actions";

const LINKS = [
  ["/admin", "Commandes"],
  ["/admin/produits", "Produits & stock"],
  ["/admin/paiements", "Moyens de paiement"],
] as const;

export function AdminNav({ current }: { current: (typeof LINKS)[number][0] }) {
  return (
    <div className="admin-nav">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>
          {label}
        </Link>
      ))}
      <form action={signOut} style={{ marginLeft: "auto" }}>
        <button className="small-btn" type="submit">Se déconnecter</button>
      </form>
    </div>
  );
}

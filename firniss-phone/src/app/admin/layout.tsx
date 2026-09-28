// L'espace admin dépend de la session : jamais pré-généré.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}

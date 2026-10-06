import data from "@/data/catalog.json";

export type Kind = "tee" | "tank" | "longsleeve" | "hoodie" | "pant";

export type Product = {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  kind: Kind;
  collection: string | null;
  categories: string[];
  price: number;
  regularPrice: number;
  inStock: boolean;
  sizes: string[];
  description: string;
  front: { src: string; cutout: string };
  back: { src: string; cutout: string } | null;
  sizeChart: string | null;
  lifestyle: string[];
};

export type Collection = { slug: string; name: string; poster: string | null; count: number };

export const products = data.items as Product[];
export const collections = data.collections as Collection[];

export const KIND_LABEL: Record<Kind, string> = {
  tee: "Tee-shirt",
  tank: "Débardeur",
  longsleeve: "Long sleeve",
  hoodie: "Sweat à capuche",
  pant: "Pant",
};

export const formatPrice = (n: number) => `${n.toLocaleString("fr-MA")} DH`;

export const isOnSale = (p: Product) => p.price < p.regularPrice;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const collectionName = (slug: string | null) =>
  collections.find((c) => c.slug === slug)?.name ?? "";

// Ordre d'affichage : en stock d'abord, puis drops les plus récents (id décroissant).
export const sorted = (list: Product[]) =>
  [...list].sort((a, b) => Number(b.inStock) - Number(a.inStock) || b.id - a.id);

export function related(p: Product, n = 4) {
  return sorted(products.filter((x) => x.id !== p.id && x.collection === p.collection)).slice(0, n);
}

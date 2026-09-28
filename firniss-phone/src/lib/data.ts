import "server-only";
import {
  SEED_PAYMENT_METHODS,
  SEED_PRODUCTS,
  type CountryCode,
  type PaymentMethod,
  type Product,
} from "./catalog";
import { createServiceClient, isSupabaseConfigured } from "./supabase/server";

type ProductRow = {
  id: string;
  name: string;
  generation: number;
  is_pro: boolean;
  condition: Product["condition"];
  camera: Product["camera"];
  has_island: boolean;
  is_new: boolean;
  colors: Product["colors"];
  storage: Product["storage"];
  stock: number;
  active: boolean;
  sort: number;
};

export function fromRow(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    generation: r.generation,
    isPro: r.is_pro,
    condition: r.condition,
    camera: r.camera,
    hasIsland: r.has_island,
    isNew: r.is_new,
    colors: r.colors,
    storage: r.storage,
    stock: r.stock,
    active: r.active,
    sort: r.sort,
  };
}

export async function getProducts({ includeInactive = false } = {}): Promise<Product[]> {
  if (!isSupabaseConfigured) return SEED_PRODUCTS;
  let q = createServiceClient().from("products").select("*").order("sort");
  if (!includeInactive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw new Error(`Lecture du catalogue impossible : ${error.message}`);
  return (data as ProductRow[]).map(fromRow);
}

export async function getPaymentMethods(country?: CountryCode): Promise<PaymentMethod[]> {
  if (!isSupabaseConfigured) {
    return SEED_PAYMENT_METHODS.filter((m) => !country || m.country === country);
  }
  let q = createServiceClient().from("payment_methods").select("*").eq("active", true).order("sort");
  if (country) q = q.eq("country", country);
  const { data, error } = await q;
  if (error) throw new Error(`Lecture des moyens de paiement impossible : ${error.message}`);
  return data as PaymentMethod[];
}

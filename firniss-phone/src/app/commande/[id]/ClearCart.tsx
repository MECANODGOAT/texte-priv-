"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

// Vide le panier une fois la commande enregistrée.
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}

export type OrderStatus = "en_attente_paiement" | "payee" | "expediee" | "livree" | "annulee";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente_paiement: "En attente de paiement",
  payee: "Payée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export const ORDER_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

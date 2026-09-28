// Types partagés et catalogue de départ.
// Le catalogue de départ sert tant que Supabase n'est pas configuré,
// et c'est lui qui a servi à générer les données de départ de supabase/setup.sql.

export type Camera = "duo" | "diag" | "trio" | "plateau";
export type Condition = "neuf" | "recond";
export type CountryCode = "MA" | "GA";
export type Currency = "MAD" | "XAF";

export type Color = { name: string; hex: string; image?: string | null };
export type StorageOption = { go: number; price: number }; // prix en euros (référence)

export type Product = {
  id: string;
  name: string;
  generation: number;
  isPro: boolean;
  condition: Condition;
  camera: Camera;
  hasIsland: boolean;
  isNew: boolean;
  colors: Color[];
  storage: StorageOption[];
  stock: number;
  active: boolean;
  sort: number;
};

export type PaymentMethod = {
  code: string;
  name: string;
  country: CountryCode;
  instructions: string;
  active: boolean;
};

export const COUNTRIES: Record<CountryCode, { name: string; currency: Currency }> = {
  MA: { name: "Maroc", currency: "MAD" },
  GA: { name: "Gabon", currency: "XAF" },
};

const s = (...pairs: [number, number][]): StorageOption[] => pairs.map(([go, price]) => ({ go, price }));
const c = (...pairs: [string, string][]): Color[] => pairs.map(([name, hex]) => ({ name, hex }));

// Prix d'exemple, à ajuster dans l'espace admin.
export const SEED_PRODUCTS: Product[] = [
  { id: "iphone-18-pro-max", name: "iPhone 18 Pro Max", generation: 18, isPro: true, condition: "neuf", camera: "plateau", hasIsland: true, isNew: true,
    storage: s([256, 1479], [512, 1709], [1024, 1939]), colors: c(["Bordeaux", "#6b1e2e"], ["Bleu nuit", "#1f2d4d"], ["Argent", "#cfd2d6"]) },
  { id: "iphone-18-pro", name: "iPhone 18 Pro", generation: 18, isPro: true, condition: "neuf", camera: "plateau", hasIsland: true, isNew: true,
    storage: s([256, 1329], [512, 1559], [1024, 1789]), colors: c(["Bleu nuit", "#1f2d4d"], ["Bordeaux", "#6b1e2e"], ["Argent", "#cfd2d6"]) },
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", generation: 17, isPro: true, condition: "neuf", camera: "plateau", hasIsland: true, isNew: false,
    storage: s([256, 1249], [512, 1479], [1024, 1709]), colors: c(["Orange cosmique", "#f07a24"], ["Bleu intense", "#2f3c5a"], ["Argent", "#d7d9dc"]) },
  { id: "iphone-17", name: "iPhone 17", generation: 17, isPro: false, condition: "neuf", camera: "duo", hasIsland: true, isNew: false,
    storage: s([256, 879], [512, 1109]), colors: c(["Noir", "#2a2a2e"], ["Blanc", "#eeeeec"], ["Bleu brume", "#9fb7d1"], ["Lavande", "#cdbbe6"], ["Sauge", "#b9c9ad"]) },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", generation: 16, isPro: true, condition: "recond", camera: "trio", hasIsland: true, isNew: false,
    storage: s([256, 949], [512, 1169], [1024, 1399]), colors: c(["Titane noir", "#3a3a3c"], ["Titane blanc", "#e6e4df"], ["Titane naturel", "#b6b0a6"], ["Titane désert", "#bfa48f"]) },
  { id: "iphone-16", name: "iPhone 16", generation: 16, isPro: false, condition: "recond", camera: "duo", hasIsland: true, isNew: false,
    storage: s([128, 649], [256, 759], [512, 979]), colors: c(["Noir", "#2c2c2e"], ["Blanc", "#f0f0ee"], ["Rose", "#f0a3d4"], ["Sarcelle", "#9ccfcb"], ["Outremer", "#7d8fe0"]) },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", generation: 15, isPro: true, condition: "recond", camera: "trio", hasIsland: true, isNew: false,
    storage: s([128, 699], [256, 809], [512, 1029]), colors: c(["Titane naturel", "#bab4aa"], ["Titane bleu", "#3d4555"], ["Titane blanc", "#e3e1dc"], ["Titane noir", "#3b3b3d"]) },
  { id: "iphone-15", name: "iPhone 15", generation: 15, isPro: false, condition: "recond", camera: "diag", hasIsland: true, isNew: false,
    storage: s([128, 529], [256, 639], [512, 859]), colors: c(["Noir", "#35383b"], ["Bleu", "#c9dde6"], ["Vert", "#d5e2c8"], ["Jaune", "#f3e7a6"], ["Rose", "#f0cdd3"]) },
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", generation: 14, isPro: true, condition: "recond", camera: "trio", hasIsland: true, isNew: false,
    storage: s([128, 589], [256, 699], [512, 919]), colors: c(["Violet intense", "#594f63"], ["Or", "#ecdcc0"], ["Argent", "#e3e4e5"], ["Noir sidéral", "#3b3a3c"]) },
  { id: "iphone-14", name: "iPhone 14", generation: 14, isPro: false, condition: "recond", camera: "diag", hasIsland: false, isNew: false,
    storage: s([128, 419], [256, 529], [512, 749]), colors: c(["Minuit", "#2b3038"], ["Lumière stellaire", "#f2ece3"], ["(PRODUCT)RED", "#c8102e"], ["Bleu", "#a9bfd4"], ["Violet", "#d5c5e3"], ["Jaune", "#f4e28d"]) },
  { id: "iphone-13-pro", name: "iPhone 13 Pro", generation: 13, isPro: true, condition: "recond", camera: "trio", hasIsland: false, isNew: false,
    storage: s([128, 459], [256, 569], [512, 789]), colors: c(["Graphite", "#4a4a4c"], ["Or", "#f0dfc2"], ["Argent", "#e4e5e3"], ["Bleu alpin", "#a7c1d9"], ["Vert alpin", "#576856"]) },
  { id: "iphone-13", name: "iPhone 13", generation: 13, isPro: false, condition: "recond", camera: "diag", hasIsland: false, isNew: false,
    storage: s([128, 349], [256, 459], [512, 679]), colors: c(["Minuit", "#2b3038"], ["Lumière stellaire", "#f2ece3"], ["(PRODUCT)RED", "#c8102e"], ["Bleu", "#2f5874"], ["Rose", "#f5d3d6"], ["Vert", "#44574a"]) },
  { id: "iphone-12", name: "iPhone 12", generation: 12, isPro: false, condition: "recond", camera: "duo", hasIsland: false, isNew: false,
    storage: s([64, 269], [128, 299], [256, 369]), colors: c(["Noir", "#25262a"], ["Blanc", "#f4f4f2"], ["(PRODUCT)RED", "#c8102e"], ["Vert", "#cfe6d3"], ["Bleu", "#2b4a7a"], ["Violet", "#b7a9d2"]) },
  { id: "iphone-11", name: "iPhone 11", generation: 11, isPro: false, condition: "recond", camera: "duo", hasIsland: false, isNew: false,
    storage: s([64, 199], [128, 229], [256, 289]), colors: c(["Violet", "#c9b8e8"], ["Jaune", "#f9e79a"], ["Vert", "#b9e2cf"], ["Noir", "#27272a"], ["Blanc", "#f4f4f2"], ["(PRODUCT)RED", "#c8102e"]) },
].map((p, i) => ({ ...p, stock: 5, active: true, sort: i })) as Product[];

export const SEED_PAYMENT_METHODS: PaymentMethod[] = [
  { code: "wafacash", name: "Wafacash", country: "MA", active: true,
    instructions: "Envoyez le montant par Wafacash au nom de [VOTRE NOM], puis envoyez-nous le code de transfert par WhatsApp." },
  { code: "banque-populaire", name: "Banque Populaire", country: "MA", active: true,
    instructions: "Faites un virement vers le RIB [VOTRE RIB BANQUE POPULAIRE], puis envoyez-nous le reçu par WhatsApp." },
  { code: "cih", name: "CIH Bank", country: "MA", active: true,
    instructions: "Faites un virement vers le RIB [VOTRE RIB CIH], puis envoyez-nous le reçu par WhatsApp." },
  { code: "airtel-money", name: "Airtel Money", country: "GA", active: true,
    instructions: "Envoyez le montant par Airtel Money au [VOTRE NUMÉRO AIRTEL], puis envoyez-nous la capture de la transaction par WhatsApp." },
  { code: "moov-money", name: "Moov Money", country: "GA", active: true,
    instructions: "Envoyez le montant par Moov Money au [VOTRE NUMÉRO MOOV], puis envoyez-nous la capture de la transaction par WhatsApp." },
  { code: "wave", name: "Wave", country: "GA", active: true,
    instructions: "Envoyez le montant par Wave au [VOTRE NUMÉRO WAVE], puis envoyez-nous la capture de la transaction par WhatsApp." },
];

// Taux de conversion depuis l'euro. Le franc CFA (XAF) a une parité fixe avec l'euro.
// Le taux du dirham se règle avec la variable NEXT_PUBLIC_EUR_TO_MAD.
export function rates(): Record<Currency, number> {
  const mad = Number(process.env.NEXT_PUBLIC_EUR_TO_MAD ?? "10.8");
  return { MAD: Number.isFinite(mad) && mad > 0 ? mad : 10.8, XAF: 655.957 };
}

// Prix affiché et facturé : converti puis arrondi à un prix "rond".
export function toLocal(eur: number, currency: Currency): number {
  const v = eur * rates()[currency];
  return currency === "XAF" ? Math.round(v / 500) * 500 : Math.round(v / 10) * 10;
}

export function formatMoney(amount: number, currency: Currency): string {
  const n = amount.toLocaleString("fr-FR").replace(/ | /g, " ");
  return currency === "XAF" ? `${n} FCFA` : `${n} DH`;
}

export const goLabel = (go: number) => (go >= 1024 ? `${go / 1024} To` : `${go} Go`);

// Récupère le catalogue public de dimensionbte.com (WooCommerce Store API)
// et l'enregistre dans src/data/catalog.json pour la maquette.
//
// Tri des photos : les packshots produits ont tous le même fond gris
// (#D8D7DB). Le premier est la face, le dernier le guide des tailles, et
// celui entre les deux (quand il existe) est le dos. Les autres images sont
// des photos portées.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const SHOP = "https://dimensionbte.com";
const OUT = new URL("../src/data/catalog.json", import.meta.url);
const CUTOUTS = new URL("../public/cutouts/", import.meta.url);
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const PACKSHOT_BG = [216, 215, 219];

// Corrections manuelles : pour les ensembles, le 2e packshot montre la tenue
// complète et non le dos. null = pas de vue de dos.
const BACK_OVERRIDES = {
  29797: null, 29790: null, 29783: null, 29776: null, 29769: null, 29754: null,
};

// Produits dont la photo principale de la boutique est en réalité le dos.
const SWAP_FRONT_BACK = [30792];

const COLLECTIONS = ["zenith", "univer", "polar-mode", "beyond-the-end", "first-horizon"];

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#8211;/g, "–").replace(/&#8217;/g, "’")
    .replace(/&rsquo;/g, "’").replace(/&nbsp;/g, " ").replace(/&#0?39;/g, "'");
const stripHtml = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// Variante redimensionnée du srcset la plus proche de `width`, sinon l'original.
function sized(image, width) {
  const candidates = (image.srcset || "").split(",").map((c) => {
    const [url, w] = c.trim().split(" ");
    return { url, w: parseInt(w, 10) };
  }).filter((c) => c.url && c.w >= width);
  candidates.sort((a, b) => a.w - b.w);
  return candidates[0]?.url ?? image.src;
}

// Détoure un packshot et l'enregistre dans public/cutouts ; renvoie son URL publique.
async function saveCutout(image, name) {
  const res = await fetch(sized(image, 700));
  const buf = await cutout(Buffer.from(await res.arrayBuffer()));
  await writeFile(new URL(name, CUTOUTS), buf);
  return `/cutouts/${name}`;
}

async function isPackshot(url) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
    .removeAlpha().resize(60, 75, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => [...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3)];
  const corners = [at(1, 1), at(58, 1), at(1, 73), at(58, 73)];
  return corners.every((c) => c.every((v, i) => Math.abs(v - PACKSHOT_BG[i]) <= 6));
}

function kindOf(name) {
  const n = name.toLowerCase();
  if (n.includes("pant")) return "pant";
  if (n.includes("capuche")) return "hoodie";
  if (n.includes("debardeur") || n.includes("débardeur")) return "tank";
  if (n.includes("long sleeve")) return "longsleeve";
  return "tee";
}

async function main() {
  const [products, categories] = await Promise.all([
    fetch(`${SHOP}/wp-json/wc/store/v1/products?per_page=100`).then((r) => r.json()),
    fetch(`${SHOP}/wp-json/wc/store/v1/products/categories`).then((r) => r.json()),
  ]);

  await mkdir(CUTOUTS, { recursive: true });
  const items = [];
  for (const p of products) {
    const flags = await Promise.all(p.images.map((im) => isPackshot(im.thumbnail)));
    const packshots = p.images.filter((_, i) => flags[i]);
    const lifestyle = p.images.filter((_, i) => !flags[i]);
    const auto = packshots.length >= 3 ? packshots[1] : null;
    let front = p.images[0];
    let back = p.id in BACK_OVERRIDES
      ? (BACK_OVERRIDES[p.id] === null ? null : p.images[BACK_OVERRIDES[p.id]])
      : auto;
    if (back && SWAP_FRONT_BACK.includes(p.id)) [front, back] = [back, front];
    const sizeChart = packshots.length >= 2 ? packshots[packshots.length - 1] : null;
    const cats = p.categories.map((c) => c.slug);
    const minor = 10 ** p.prices.currency_minor_unit;

    items.push({
      id: p.id,
      slug: p.slug,
      name: decode(p.name),
      permalink: p.permalink,
      kind: kindOf(p.name),
      collection: COLLECTIONS.find((c) => cats.includes(c)) ?? null,
      categories: cats,
      price: Number(p.prices.price) / minor,
      regularPrice: Number(p.prices.regular_price) / minor,
      inStock: p.is_in_stock,
      sizes: p.attributes.flatMap((a) => a.terms.map((t) => t.name))
        .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)),
      description: stripHtml(p.short_description || p.description || ""),
      front: { src: sized(front, 700), cutout: await saveCutout(front, `${p.id}-front.webp`) },
      back: back ? { src: sized(back, 700), cutout: await saveCutout(back, `${p.id}-back.webp`) } : null,
      sizeChart: sizeChart ? sized(sizeChart, 700) : null,
      lifestyle: lifestyle.map((im) => sized(im, 700)),
    });
  }

  const collections = COLLECTIONS.map((slug) => {
    const c = categories.find((x) => x.slug === slug);
    return { slug, name: decode(c?.name ?? slug), poster: c?.image?.src ?? null, count: c?.count ?? 0 };
  });

  await writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), collections, items }, null, 2) + "\n");
  const withBack = items.filter((i) => i.back).length;
  console.log(`${items.length} produits (${withBack} avec vue de dos), ${collections.length} collections`);
}

main().catch((e) => { console.error(e); process.exit(1); });

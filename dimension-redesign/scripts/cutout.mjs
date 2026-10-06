// Détourage des packshots : flood fill depuis les bords sur la couleur de
// fond grise, puis adoucissement du contour (alpha progressif sur 1-2 px).
import sharp from "sharp";

const BG = [216, 215, 219];
const HARD = 9; // distance max considérée comme fond pur
const SOFT = 22; // au-delà : opaque ; entre les deux : semi-transparent

export async function cutout(input, width = 700) {
  const { data, info } = await sharp(input).removeAlpha().resize({ width })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const dist = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3] - BG[0], g = data[i * 3 + 1] - BG[1], b = data[i * 3 + 2] - BG[2];
    dist[i] = Math.sqrt(r * r + g * g + b * b);
  }
  // Flood fill (4-connexité) depuis tous les pixels de bord proches du fond.
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (i) => { if (!bg[i] && dist[i] <= HARD) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  // Ouverture morphologique (érosion puis dilatation) : supprime les fines
  // lignes parasites qui relient parfois le vêtement aux bords. Une érosion
  // supplémentaire de 1 px retire le liseré gris des vêtements sombres.
  let fg = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) fg[i] = bg[i] ? 0 : 1;
  fg = morph(fg, w, h, 3, "erode");
  fg = morph(fg, w, h, 3, "dilate");
  fg = morph(fg, w, h, 1, "erode");
  const out = Buffer.alloc(w * h * 4);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let i = 0; i < w * h; i++) {
    let a = 0;
    if (fg[i]) {
      const x = i % w;
      const edge = (x > 0 && !fg[i - 1]) || (x < w - 1 && !fg[i + 1]) || (i >= w && !fg[i - w]) || (i < w * (h - 1) && !fg[i + w]);
      a = edge ? Math.min(255, Math.max(90, Math.round(255 * (dist[i] - HARD) / (SOFT - HARD)))) : 255;
    }
    out[i * 4] = data[i * 3]; out[i * 4 + 1] = data[i * 3 + 1]; out[i * 4 + 2] = data[i * 3 + 2]; out[i * 4 + 3] = a;
    if (a > 0) { const x = i % w, y = (i / w) | 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  // Recadrage centré avec une marge constante pour que face et dos s'alignent.
  const pad = Math.round(w * 0.04);
  const left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: Math.min(w, maxX + pad) - left, height: Math.min(h, maxY + pad) - top })
    .webp({ quality: 82, alphaQuality: 90 }).toBuffer();
}

// Érosion / dilatation d'un masque binaire avec un noyau carré (séparable).
function morph(mask, w, h, r, op) {
  const keep = op === "erode" ? 1 : 0; // valeur que tout le voisinage doit avoir
  const pass = (src, horizontal) => {
    const dst = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = keep;
      for (let k = -r; k <= r; k++) {
        const xx = horizontal ? x + k : x, yy = horizontal ? y : y + k;
        const s = xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : src[yy * w + xx];
        if (s !== keep) { v = 1 - keep; break; }
      }
      dst[y * w + x] = v;
    }
    return dst;
  };
  return pass(pass(mask, true), false);
}

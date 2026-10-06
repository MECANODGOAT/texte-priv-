// Télécharge les vidéos listées dans src/data/videos.json et les convertit en
// MP4 H.264 lisible partout (les .mov d'origine sont en HEVC), avec une image
// d'aperçu. Nécessite ffmpeg. Résultat : public/videos/<id>.mp4 et <id>.jpg.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "public/videos");
const { reels, products } = JSON.parse(await readFile(join(root, "src/data/videos.json"), "utf8"));
await mkdir(out, { recursive: true });

// Reels verticaux 9:16 en 540×960 avec le son ; animations produit 4:5 en
// 720×900 sans le son (lues en boucle, muettes).
const jobs = [
  ...reels.map((v) => ({ ...v, scale: "540:-2", audio: true })),
  ...products.map((v) => ({ ...v, scale: "720:-2", audio: false })),
];

for (const v of jobs) {
  const mp4 = join(out, `${v.id}.mp4`);
  if (existsSync(mp4) && !process.argv.includes("--force")) continue;
  const src = join(tmpdir(), `dimension-${v.id}`);
  const res = await fetch(v.source);
  if (!res.ok) throw new Error(`${v.source} : HTTP ${res.status}`);
  await writeFile(src, Buffer.from(await res.arrayBuffer()));
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", src,
    "-vf", `scale=${v.scale}:flags=lanczos,fps=30`,
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "27", "-maxrate", "1600k", "-bufsize", "3200k",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    ...(v.audio ? ["-c:a", "aac", "-b:a", "96k", "-ac", "2"] : ["-an"]),
    mp4,
  ]);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", "0.8", "-i", mp4, "-frames:v", "1", "-q:v", "4", join(out, `${v.id}.jpg`)]);
  await rm(src);
  console.log(`✓ ${v.id} ${v.title ?? ""}`);
}

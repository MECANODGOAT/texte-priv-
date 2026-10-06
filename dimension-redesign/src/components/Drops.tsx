import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRight } from "./Icons";
import AutoVideo from "./AutoVideo";
import { reelsFor, type Collection } from "@/lib/catalog";

export default function Drops({ collections }: { collections: Collection[] }) {
  return (
    <section id="drops" className="section" aria-labelledby="drops-title">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <span className="kicker">Collections</span>
            <h2 id="drops-title">Les drops</h2>
          </div>
          <p>Chaque collection raconte un univers. Faites défiler, choisissez votre dimension.</p>
        </Reveal>
        <div className="drops">
          {collections.filter((c) => c.poster).map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link href={`/collection/${c.slug}`} className="drop">
                <Image src={c.poster!} alt={`Affiche de la collection ${c.name}`} fill sizes="(max-width: 900px) 78vw, 30vw" />
                {reelsFor(c.slug)[0] && (
                  <AutoVideo className="drop-video" trigger="hover" src={reelsFor(c.slug)[0].src} poster={reelsFor(c.slug)[0].poster} />
                )}
                <span className="drop-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="drop-label">
                  <div>
                    <h3>{c.name}</h3>
                    <span>{c.count} pièces</span>
                  </div>
                  <span className="drop-arrow" aria-hidden><ArrowUpRight /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

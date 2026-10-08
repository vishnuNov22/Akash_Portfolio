"use client";

import { useEffect, useMemo, useState } from "react";
import Ring3D from "./Ring3D";
import { useLightbox } from "./Lightbox";
import { CATEGORIES, PHOTOS, SAMPLE_PHOTOS } from "@/data/site";

// Full 3D archive: drag the ring, filter by category, open in the lightbox.
export default function Archive() {
  const { open } = useLightbox();
  const [cat, setCat] = useState("All");
  const [full, setFull] = useState(false);
  const list = useMemo(() => (cat === "All" ? PHOTOS.filter((_, i) => i % 2 === 0) : PHOTOS.filter((p) => p.cat === cat)), [cat]);
  const ringList = useMemo(() => (list.length < 8 ? [...list, ...list] : list), [list]);

  useEffect(() => {
    const on = (e) => setCat(e.detail);
    window.addEventListener("akash:filter", on);
    return () => window.removeEventListener("akash:filter", on);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", full);
    const k = (e) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [full]);

  const chips = (
    <div className="ar-chips" role="tablist" aria-label="Filter the 3D archive">
      {["All", ...CATEGORIES].map((c) => (
        <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
          {c}
        </button>
      ))}
    </div>
  );

  return (
    <section className="archive sec" id="archive">
      <div className="wrap ar-head">
        <div>
          <p className="label">( Archive — in 3D )</p>
          <h2 className="h-xl">Spin through <em>every story.</em></h2>
        </div>
        <button className="ar-full" onClick={() => setFull(true)} data-cursor="ENTER">
          <span>⤢</span> Full-screen 3D
        </button>
      </div>
      <div className="wrap">{chips}</div>
      <div className="ar-stage">
        {!full && <Ring3D key={cat} photos={ringList} onOpen={(p) => open(list, Math.max(0, list.indexOf(p)))} />}
        <p className="ar-hint" aria-hidden="true">Drag to spin · click a frame to open</p>
      </div>
      {SAMPLE_PHOTOS && <p className="sample-note">Sample imagery shown — Akash&apos;s own work will replace it.</p>}

      {full && (
        <div className="ar-overlay" role="dialog" aria-modal="true" aria-label="Full-screen 3D archive">
          <Ring3D key={`f-${cat}`} photos={ringList} onOpen={(p) => open(list, Math.max(0, list.indexOf(p)))} className="big" />
          <div className="ar-overlay-top">
            {chips}
            <button onClick={() => setFull(false)} aria-label="Close full-screen archive">Close ✕</button>
          </div>
        </div>
      )}
    </section>
  );
}

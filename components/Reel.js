"use client";

import { useEffect, useRef, useState } from "react";
import { onFrame, clamp } from "@/lib/scroll";
import { useLightbox } from "./Lightbox";
import { REEL } from "@/data/site";

// Pinned horizontal reel. Cards turn in 3D as they cross the screen (cover-flow) and skew with scroll speed.
export default function Reel() {
  const sec = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const [count, setCount] = useState(1);
  const { open } = useLightbox();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = [...track.current.querySelectorAll(".rl-card")];
    let dist = 0;
    const size = () => {
      dist = Math.max(0, track.current.scrollWidth - window.innerWidth);
      sec.current.style.height = `${dist + window.innerHeight}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(track.current);
    window.addEventListener("resize", size);
    let last = 0;
    const off = onFrame(({ v, vw }) => {
      const r = sec.current.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) return;
      const p = clamp(-r.top / Math.max(1, dist));
      track.current.style.transform = `translate3d(${-p * dist}px,0,0)`;
      bar.current.style.transform = `scaleX(${p})`;
      const skew = reduced ? 0 : Math.max(-6, Math.min(6, v * 0.12));
      let best = 0, bestD = 1e9;
      cards.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        const center = cr.left + cr.width / 2;
        const d = (center - vw / 2) / vw; // -1 … 1
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
        if (reduced) return;
        const ry = Math.max(-38, Math.min(38, -d * 46));
        const z = -Math.abs(d) * 160;
        c.style.transform = `perspective(1400px) translateZ(${z}px) rotateY(${ry}deg) skewX(${skew}deg)`;
        const img = c.firstChild.firstChild;
        img.style.transform = `translate3d(${d * -60}px,0,0) scale(1.22)`;
      });
      if (best + 1 !== last) { last = best + 1; setCount(last); }
    });
    return () => {
      off();
      ro.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <section className="reel" id="works" ref={sec}>
      <div className="rl-sticky">
        <div className="rl-head">
          <p className="label">( Selected works )</p>
          <h2 className="h-xl">Frames that <em>stayed.</em></h2>
          <div className="rl-count"><b>{String(count).padStart(2, "0")}</b> / {String(REEL.length).padStart(2, "0")}</div>
        </div>
        <div className="rl-track" ref={track}>
          {REEL.map((p, i) => (
            <figure className={`rl-card s${i % 3}`} key={p.src}>
              <button onClick={() => open(REEL, i)} data-cursor="OPEN" aria-label={`Open ${p.title}`}>
                <img src={p.thumb} alt={`${p.title} — ${p.cat}`} loading="lazy" />
              </button>
              <figcaption>
                <span>{String(i + 1).padStart(2, "0")} — {p.cat}</span>
                <b>{p.title}</b>
              </figcaption>
            </figure>
          ))}
          <div className="rl-end">
            <a href="#archive" className="rl-more" data-cursor="3D">Explore everything in 3D →</a>
          </div>
        </div>
        <div className="rl-progress"><i ref={bar} /></div>
      </div>
    </section>
  );
}

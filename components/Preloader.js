"use client";

import { useEffect, useState } from "react";
import { HERO_SLIDES, SITE } from "@/data/site";

// Counter 0→100 with a flickering photo stack, then the last frame expands and the page opens.
export default function Preloader() {
  const [n, setN] = useState(0);
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState("count"); // count → expand → done

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("done");
      document.documentElement.classList.add("is-loaded");
      window.dispatchEvent(new Event("akash:loaded"));
      return;
    }
    document.documentElement.classList.add("is-loading");
    const DUR = 1700;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / DUR);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(eased * 100));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const flick = setInterval(() => setFrame((f) => (f + 1) % HERO_SLIDES.length), 170);
    const t1 = setTimeout(() => {
      clearInterval(flick);
      setFrame(0);
      setPhase("expand");
    }, DUR + 150);
    const t2 = setTimeout(() => {
      setPhase("done");
      document.documentElement.classList.remove("is-loading");
      document.documentElement.classList.add("is-loaded");
      window.dispatchEvent(new Event("akash:loaded"));
    }, DUR + 1100);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(flick);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;
  return (
    <div className={`preloader ${phase}`} aria-hidden="true">
      <div className="pl-stack">
        {HERO_SLIDES.map((p, i) => (
          <img key={p.thumb} src={p.thumb} alt="" className={i === frame ? "on" : ""} />
        ))}
      </div>
      <div className="pl-name">
        <span>{SITE.name}</span>
        <small>{SITE.role} · Live moments</small>
      </div>
      <div className="pl-count">
        {String(n).padStart(3, "0")}
        <i>%</i>
      </div>
      <div className="pl-bar" style={{ transform: `scaleX(${n / 100})` }} />
    </div>
  );
}

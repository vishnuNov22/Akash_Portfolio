"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { CATEGORIES, CATEGORY_TEXT, PHOTOS } from "@/data/site";

// Hover a row: a floating photo follows the cursor, tilting with its speed.
export default function Expertise() {
  const float = useRef(null);
  const [active, setActive] = useState(-1);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0, run: false });

  useEffect(() => {
    let raf;
    const loop = () => {
      const p = pos.current;
      const dx = p.tx - p.x;
      p.x += dx * 0.12;
      p.y += (p.ty - p.y) * 0.12;
      if (float.current) float.current.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${Math.max(-14, Math.min(14, dx * 0.08))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const move = (e) => {
    pos.current.tx = e.clientX;
    pos.current.ty = e.clientY;
  };
  const pick = (cat) => {
    window.dispatchEvent(new CustomEvent("akash:filter", { detail: cat }));
    document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="expertise sec" id="expertise" onPointerMove={move}>
      <div className="wrap">
        <div className="sec-head">
          <p className="label">( What I shoot )</p>
          <h2 className="h-xl">More than <em>weddings.</em></h2>
        </div>
        <ul className="ex-list" onPointerLeave={() => setActive(-1)}>
          {CATEGORIES.map((c, i) => {
            const list = PHOTOS.filter((p) => p.cat === c);
            return (
              <Reveal as="li" key={c} delay={i * 0.04}>
                <button className={`ex-row ${active === i ? "on" : ""}`} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => pick(c)} data-cursor="VIEW">
                  <span className="ex-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ex-name">{c}</span>
                  <span className="ex-text">{CATEGORY_TEXT[c]}</span>
                  <span className="ex-count">({String(list.length).padStart(2, "0")})</span>
                  <span className="ex-thumb"><img src={list[0].thumb} alt="" loading="lazy" /></span>
                </button>
              </Reveal>
            );
          })}
        </ul>
      </div>
      <div className={`ex-float ${active >= 0 ? "on" : ""}`} ref={float} aria-hidden="true">
        {CATEGORIES.map((c, i) => {
          const p = PHOTOS.find((x) => x.cat === c);
          return <img key={c} src={p.thumb} alt="" className={i === active ? "on" : ""} />;
        })}
      </div>
    </section>
  );
}

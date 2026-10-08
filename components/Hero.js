"use client";

import { useEffect, useRef, useState } from "react";
import { createHeroGL } from "@/lib/heroGL";
import { CATEGORY_TEXT, HERO_SLIDES, SITE } from "@/data/site";

const N = HERO_SLIDES.length;
const pad = (n) => String(n).padStart(2, "0");

export default function Hero() {
  const mount = useRef(null);
  const api = useRef(null);
  const [idx, setIdx] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let gl = null;
    let cancelled = false;
    import("three")
      .then((THREE) => {
        if (cancelled || !mount.current) return;
        try {
          gl = createHeroGL(THREE, mount.current, HERO_SLIDES.map((p) => p.src), { onChange: setIdx });
          api.current = gl;
        } catch (e) {
          console.warn("WebGL hero unavailable:", e);
          setFallback(true);
        }
      })
      .catch(() => setFallback(true));
    return () => {
      cancelled = true;
      if (gl) gl.destroy();
    };
  }, []);

  // simple crossfade slideshow when WebGL isn't available
  useEffect(() => {
    if (!fallback) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % N), 5200);
    return () => clearInterval(t);
  }, [fallback]);

  const go = (i) => (api.current ? api.current.goTo(i) : setIdx(((i % N) + N) % N));
  const cur = HERO_SLIDES[idx];

  return (
    <section className="hero" id="home" aria-label={`${SITE.name} — photographer`}>
      <div className="hero-gl" ref={mount} data-cursor="EXPLORE">
        {fallback &&
          HERO_SLIDES.map((p, i) => <img key={p.src} src={p.src} alt="" className={`hero-fb ${i === idx ? "on" : ""}`} />)}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="letterbox" aria-hidden="true"><i /><i /></div>

      <div className="hero-top">
        <p>
          <span className="dot" /> Available for bookings
        </p>
        <p className="hide-sm">Weddings · Portraits · Street · Travel · Nature · Events · Fashion</p>
      </div>

      <ol className="hero-index" aria-label="Categories">
        {HERO_SLIDES.map((p, i) => (
          <li key={p.cat} className={i === idx ? "on" : ""}>
            <button onClick={() => go(i)}>
              <small>{pad(i + 1)}</small>
              {p.cat}
            </button>
            {i === idx && <span className="bar" key={`b${idx}`} />}
          </li>
        ))}
      </ol>

      <div className="hero-cat">
        <div className="hero-count">
          <b key={`n${idx}`}>{pad(idx + 1)}</b> / {pad(N)}
        </div>
        <h2 key={`c${idx}`} className="roll">
          {cur.cat.split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.035}s` }}>{ch}</span>
          ))}
        </h2>
        <p key={`t${idx}`} className="fade">{CATEGORY_TEXT[cur.cat]}</p>
        <div className="hero-arrows">
          <button onClick={() => go(idx - 1)} aria-label="Previous category">←</button>
          <button onClick={() => go(idx + 1)} aria-label="Next category">→</button>
        </div>
      </div>

      <h1 className="hero-name" aria-label={SITE.name}>
        {SITE.name.toUpperCase().split("").map((ch, i) => (
          <span key={i} style={{ "--i": i }}>{ch}</span>
        ))}
      </h1>
      <p className="hero-sub">
        <em>{SITE.role}</em> — {SITE.tagline}
      </p>
      <a href="#statement" className="hero-scroll" aria-label="Scroll down">
        <i />
      </a>
    </section>
  );
}
